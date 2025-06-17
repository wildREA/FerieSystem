// Calendar page functionality for PDF upload and viewing

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fileInput = document.getElementById('calendarPdfUpload');
    const uploadButton = document.getElementById('uploadButton');
    const removeButton = document.getElementById('removeCalendarButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadStatusText = document.getElementById('uploadStatusText');
    const noPdfMessage = document.getElementById('noPdfMessage');
    const pdfEmbed = document.getElementById('pdfEmbed');
    const pdfViewer = document.getElementById('pdfViewer');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const pdfContainer = document.getElementById('pdfContainer');
    
    let pdfObjectUrl = null;
    let isInFullscreenMode = false;
    
    // Set up event listeners
    uploadButton.addEventListener('click', uploadPdf);
    removeButton.addEventListener('click', removePdf);
    fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // Check for existing PDF in session storage
    checkForExistingPdf();
    
    /**
     * Upload and display the selected PDF
     */
    function uploadPdf() {
        const file = fileInput.files[0];
        
        if (!file) {
            showUploadStatus('Please select a PDF file first', 'danger');
            return;
        }
        
        if (file.type !== 'application/pdf') {
            showUploadStatus('Only PDF files are supported', 'danger');
            return;
        }
        
        // Create a hidden iframe instead of using blob URL directly for better security
        createPdfIframe(file);
        
        // Store file name in session storage
        sessionStorage.setItem('calendarPdfName', file.name);
        
        // Show success message
        showUploadStatus('Calendar uploaded successfully', 'success');
    }
    
    /**
     * Create an iframe to display the PDF
     * This is more secure than using blob URLs directly
     */
    function createPdfIframe(file) {
        // Revoke previous object URL if exists to prevent memory leaks
        if (pdfObjectUrl) {
            URL.revokeObjectURL(pdfObjectUrl);
        }
        
        // Create object URL
        pdfObjectUrl = URL.createObjectURL(file);
        
        // Create iframe element
        const iframe = document.createElement('iframe');
        iframe.id = 'pdfViewer';
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        
        // Set iframe source
        iframe.src = pdfObjectUrl;
        
        // Clear pdfEmbed and add the iframe
        pdfEmbed.innerHTML = '';
        pdfEmbed.appendChild(iframe);
        
        // Show PDF embed, hide no PDF message
        noPdfMessage.style.display = 'none';
        pdfEmbed.style.display = 'block';
    }
    
    /**
     * Show upload status message
     */
    function showUploadStatus(message, type = 'success') {
        uploadStatusText.textContent = message;
        uploadStatus.querySelector('.alert').className = `alert alert-${type}`;
        uploadStatus.style.display = 'block';
        
        // Hide the status after 3 seconds
        setTimeout(() => {
            uploadStatus.style.display = 'none';
        }, 3000);
    }
    
    /**
     * Remove the current PDF
     */
    function removePdf() {
        // Clear file input
        fileInput.value = '';
        
        // Hide PDF embed, show no PDF message
        pdfEmbed.style.display = 'none';
        noPdfMessage.style.display = 'flex';
        
        // Revoke object URL
        if (pdfObjectUrl) {
            URL.revokeObjectURL(pdfObjectUrl);
            pdfObjectUrl = null;
        }
        
        // Clear session storage
        sessionStorage.removeItem('calendarPdfName');
        
        // Show status message
        showUploadStatus('Calendar has been removed', 'success');
        
        // Exit fullscreen mode if active
        if (isInFullscreenMode) {
            exitFullscreenMode();
        }
    }
    
    /**
     * Check for an existing PDF in session storage
     */
    function checkForExistingPdf() {
        const savedPdfName = sessionStorage.getItem('calendarPdfName');
        
        if (savedPdfName && fileInput.files && fileInput.files[0]) {
            // We have a file selected and stored in session
            uploadPdf();
        }
    }
    
    /**
     * Toggle fullscreen mode for the PDF viewer
     */
    function toggleFullscreen() {
        if (!isInFullscreenMode) {
            // Enter fullscreen mode
            enterFullscreenMode();
        } else {
            // Exit fullscreen mode
            exitFullscreenMode();
        }
    }
    
    /**
     * Enter fullscreen mode
     */
    function enterFullscreenMode() {
        if (!pdfObjectUrl) return;
        
        // Create fullscreen container
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.className = 'pdf-fullscreen';
        fullscreenContainer.id = 'pdfFullscreen';
        
        // Create fullscreen header
        const header = document.createElement('div');
        header.className = 'pdf-fullscreen-header';
        header.innerHTML = `
            <h3>Calendar - Fullscreen View</h3>
            <button class="pdf-fullscreen-close" id="exitFullscreenButton">
                <i class="bi bi-x-lg"></i>
            </button>
        `;
        
        // Clone the PDF embed for fullscreen
        const fullscreenEmbed = pdfEmbed.cloneNode(true);
        
        // Assemble the fullscreen view
        fullscreenContainer.appendChild(header);
        fullscreenContainer.appendChild(fullscreenEmbed);
        
        // Add to document body
        document.body.appendChild(fullscreenContainer);
        
        // Set up exit fullscreen button
        document.getElementById('exitFullscreenButton').addEventListener('click', exitFullscreenMode);
        
        // Update state
        isInFullscreenMode = true;
    }
    
    /**
     * Exit fullscreen mode
     */
    function exitFullscreenMode() {
        const fullscreenContainer = document.getElementById('pdfFullscreen');
        if (fullscreenContainer) {
            fullscreenContainer.remove();
        }
        isInFullscreenMode = false;
    }
});
