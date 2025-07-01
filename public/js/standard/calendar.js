// Calendar page functionality for PDF viewing (standard users)

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const noPdfMessage = document.getElementById("noPdfMessage");
  const pdfEmbed = document.getElementById("pdfEmbed");
  const pdfContainer = document.getElementById("pdfContainer");

  // Check if required elements exist
  if (!noPdfMessage || !pdfEmbed) {
    console.error("Calendar.js: Required DOM elements not found");
    return;
  }

  // Check for existing PDF on page load
  checkForExistingPdf();

  /**
   * Create an iframe to display the PDF
   * @param {string} source - A URL string from the server
   */
  function createPdfIframe(source) {
    // Create iframe element
    const iframe = document.createElement("iframe");
    iframe.id = "pdfViewer";
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.src = source;

    // Clear pdfEmbed and add the iframe
    pdfEmbed.innerHTML = "";
    pdfEmbed.appendChild(iframe);

    // Show PDF embed, hide no PDF message
    noPdfMessage.style.display = "none";
    pdfEmbed.style.display = "block";
  }

  /**
   * Check for an existing PDF on the server
   */
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
        console.log(`Calendar loaded (uploaded: ${data.uploadTime})`);
      } else if (data.success && !data.exists) {
        // No existing PDF, show the default message
        noPdfMessage.style.display = "flex";
        pdfEmbed.style.display = "none";
      } else {
        // API returned success: false
        console.warn('Calendar API returned error:', data.message);
        noPdfMessage.style.display = "flex";
        pdfEmbed.style.display = "none";
      }
    })
    .catch(error => {
      console.error('Error checking for existing PDF:', error);
      // Show default state on error
      noPdfMessage.style.display = "flex";
      pdfEmbed.style.display = "none";
      
      // Only log error message if it's not a common "no file" scenario
      if (!error.message.includes('404') && !error.message.includes('Empty response')) {
        console.warn("Could not check for existing calendar: " + error.message);
      }
    });
  }
});
