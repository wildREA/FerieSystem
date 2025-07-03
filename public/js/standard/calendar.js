document.addEventListener("DOMContentLoaded", function () {
  const noPdfMessage = document.getElementById("noPdfMessage");
  const pdfEmbed = document.getElementById("pdfEmbed");
  const pdfContainer = document.getElementById("pdfContainer");

  if (!noPdfMessage || !pdfEmbed) {
    console.error("Calendar.js: Required DOM elements not found");
    return;
  }

  checkForExistingPdf();

  function createPdfIframe(source) {
    const iframe = document.createElement("iframe");
    iframe.id = "pdfViewer";
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.src = source;

    pdfEmbed.innerHTML = "";
    pdfEmbed.appendChild(iframe);

    noPdfMessage.style.display = "none";
    pdfEmbed.style.display = "block";
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
        createPdfIframe(data.url);
        console.log(`Calendar loaded (uploaded: ${data.uploadTime})`);
      } else if (data.success && !data.exists) {
        noPdfMessage.style.display = "flex";
        pdfEmbed.style.display = "none";
      } else {
        console.warn('Calendar API returned error:', data.message);
        noPdfMessage.style.display = "flex";
        pdfEmbed.style.display = "none";
      }
    })
    .catch(error => {
      console.error('Error checking for existing PDF:', error);
      noPdfMessage.style.display = "flex";
      pdfEmbed.style.display = "none";
      
      if (!error.message.includes('404') && !error.message.includes('Empty response')) {
        console.warn("Could not check for existing calendar: " + error.message);
      }
    });
  }
});
