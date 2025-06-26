// Requests page specific functionality

document.addEventListener("DOMContentLoaded", function() {
    // Reference to the current page element
    const currentPageElement = document.getElementById('currentPage');
    
    // Only initialize if we are on the requests page
    if (currentPageElement && currentPageElement.value === 'requests') {
        initRequestsPage();
    }
    
    /**
     * Initialize the requests page functionality
     */
    function initRequestsPage() {
        // Check if we have a search query stored in localStorage from redirect
        const searchQuery = localStorage.getItem('searchQuery');
        if (searchQuery) {
            // Get the search input field
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                // Set the search input value
                searchInput.value = searchQuery;
                // Trigger the search function if available
                if (typeof window.handleSearch === 'function') {
                    // Create a synthetic event with the searchInput as target
                    const event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    
                    // Add the target property to the event
                    Object.defineProperty(event, 'target', {
                        value: searchInput,
                        enumerable: true
                    });
                    
                    window.handleSearch(event);
                }
                
                // Clear the localStorage item to prevent future redirects
                localStorage.removeItem('searchQuery');
            }
        }
    }
});

/**
 * Approve a student's vacation request
 * @param {string} studentId - The ID of the student whose request is being approved
 */
window.approveRequest = function(studentId) {
    // Get the students data from the global variable
    const studentsData = window.studentsData || [];
    
    if (!studentsData.length) {
        console.error('Student data not available');
        return;
    }
    
    // Find the student by ID
    const studentIndex = studentsData.findIndex(student => student.id === studentId);
    if (studentIndex === -1) {
        console.error(`Student with ID ${studentId} not found`);
        return;
    }
    
    // Update the student's status to approved
    studentsData[studentIndex].status = 'approved';
    
    // Show success notification if the notification function exists
    if (typeof window.showNotification === 'function') {
        window.showNotification(`Request for ${studentsData[studentIndex].name} has been approved`, 'success');
    } else {
        alert(`Request for ${studentsData[studentIndex].name} has been approved`);
    }
    
    // Refresh the display if needed
    if (typeof window.renderStudents === 'function') {
        window.renderStudents(studentsData);
    }
};

/**
 * Deny a student's vacation request
 * @param {string} studentId - The ID of the student whose request is being denied
 */
window.denyRequest = function(studentId) {
    // Get the students data from the global variable
    const studentsData = window.studentsData || [];
    
    if (!studentsData.length) {
        console.error('Student data not available');
        return;
    }
    
    // Find the student by ID
    const studentIndex = studentsData.findIndex(student => student.id === studentId);
    if (studentIndex === -1) {
        console.error(`Student with ID ${studentId} not found`);
        return;
    }
    
    // Update the student's status to denied
    studentsData[studentIndex].status = 'denied';
    
    // Show success notification if the notification function exists
    if (typeof window.showNotification === 'function') {
        window.showNotification(`Request for ${studentsData[studentIndex].name} has been denied`, 'danger');
    } else {
        alert(`Request for ${studentsData[studentIndex].name} has been denied`);
    }
    
    // Refresh the display if needed
    if (typeof window.renderStudents === 'function') {
        window.renderStudents(studentsData);
    }
};
