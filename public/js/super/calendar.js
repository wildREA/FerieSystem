document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("calendarPdfUpload");
  const uploadButton = document.getElementById("uploadButton");
  const removeButton = document.getElementById("removeCalendarButton");
  const uploadStatus = document.getElementById("uploadStatus");
  const uploadStatusText = document.getElementById("uploadStatusText");
  const noPdfMessage = document.getElementById("noPdfMessage");
  const pdfEmbed = document.getElementById("pdfEmbed");
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfContainer = document.getElementById("pdfContainer");

  let pdfObjectUrl = null;

  if (!fileInput || !uploadButton || !uploadStatus || !uploadStatusText || !noPdfMessage || !pdfEmbed) {
    console.error("Calendar.js: Required DOM elements not found");
    return;
  }

  uploadButton.addEventListener("click", uploadPdf);
  if (removeButton) {
    removeButton.addEventListener("click", removePdf);
  }

  checkForExistingPdf();

  function uploadPdf() {
    const file = fileInput.files[0];

    if (!file) {
      showUploadStatus("Please select a PDF file first", "danger");
      return;
    }

    if (file.type !== "application/pdf") {
      showUploadStatus("Only PDF files are supported", "danger");
      return;
    }

    showUploadStatus("Uploading calendar...", "info");
    uploadButton.disabled = true;

    const formData = new FormData();
    formData.append('calendar', file);

    fetch('/api/calendar/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        createPdfIframe(data.url);
        showUploadStatus("Calendar uploaded successfully", "success");
        
        if (removeButton) {
          removeButton.style.display = 'inline-block';
        }
      } else {
        showUploadStatus(data.message || "Upload failed", "danger");
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      showUploadStatus("Upload failed: " + error.message, "danger");
    })
    .finally(() => {
      uploadButton.disabled = false;
    });
  }

  function createPdfIframe(source) {
    // Revoke previous object URL if exists to prevent memory leaks
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
      pdfObjectUrl = null;
    }

    // Create iframe element
    const iframe = document.createElement("iframe");
    iframe.id = "pdfViewer";
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";

    // Set iframe source based on the type of source
    if (typeof source === 'string') {
      // It's a URL string from the server
      iframe.src = source;
    } else {
      // It's a File object, create object URL
      pdfObjectUrl = URL.createObjectURL(source);
      iframe.src = pdfObjectUrl;
    }

    // Clear pdfEmbed and add the iframe
    pdfEmbed.innerHTML = "";
    pdfEmbed.appendChild(iframe);

    // Show PDF embed, hide no PDF message
    noPdfMessage.style.display = "none";
    pdfEmbed.style.display = "block";
  }

  function showUploadStatus(message, type = "success") {
    uploadStatusText.textContent = message;
    uploadStatus.querySelector(".alert").className = `alert alert-${type}`;
    uploadStatus.style.display = "block";

    // Hide the status after 3 seconds
    setTimeout(() => {
      uploadStatus.style.display = "none";
    }, 3000);
  }

  function removePdf() {
    // Show removing status
    showUploadStatus("Removing calendar...", "info");
    removeButton.disabled = true;

    // Call delete API
    fetch('/api/calendar', {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Clear file input
        fileInput.value = "";

        // Hide PDF embed, show no PDF message
        pdfEmbed.style.display = "none";
        noPdfMessage.style.display = "flex";

        // Revoke object URL
        if (pdfObjectUrl) {
          URL.revokeObjectURL(pdfObjectUrl);
          pdfObjectUrl = null;
        }

        showUploadStatus("Calendar has been removed", "success");

        // Hide remove button
        if (removeButton) {
          removeButton.style.display = 'none';
        }
      } else {
        showUploadStatus(data.message || "Failed to remove calendar", "danger");
      }
    })
    .catch(error => {
      console.error('Delete error:', error);
      showUploadStatus("Failed to remove calendar: " + error.message, "danger");
    })
    .finally(() => {
      removeButton.disabled = false;
    });
  }

  function checkForExistingPdf() {
    fetch('/api/calendar/info')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is empty
      if (response.headers.get('content-length') === '0') {
        throw new Error('Empty response from server');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      return response.json();
    })
    .then(data => {
      if (data.success && data.exists) {
        // Display the existing PDF from server
        createPdfIframe(data.url);
        showUploadStatus(`Calendar loaded (uploaded: ${data.uploadTime})`, "success");
        
        // Show remove button
        if (removeButton) {
          removeButton.style.display = 'inline-block';
        }
      } else if (data.success && !data.exists) {
        // No existing PDF, show the default message
        noPdfMessage.style.display = "flex";
        pdfEmbed.style.display = "none";
        
        // Hide remove button
        if (removeButton) {
          removeButton.style.display = 'none';
        }
      } else {
        // API returned success: false
        console.warn('Calendar API returned error:', data.message);
        noPdfMessage.style.display = "flex";
        pdfEmbed.style.display = "none";
        
        if (removeButton) {
          removeButton.style.display = 'none';
        }
      }
    })
    .catch(error => {
      console.error('Error checking for existing PDF:', error);
      // Show default state on error
      noPdfMessage.style.display = "flex";
      pdfEmbed.style.display = "none";
      
      if (removeButton) {
        removeButton.style.display = 'none';
      }
      
      // Only show error message if it's not a common "no file" scenario
      if (!error.message.includes('404') && !error.message.includes('Empty response')) {
        showUploadStatus("Could not check for existing calendar: " + error.message, "warning");
      }
    });
  }
});
