document.addEventListener("DOMContentLoaded", function() {
    const currentPageElement = document.getElementById('currentPage');
    
    if (currentPageElement && currentPageElement.value === 'requests') {
        initRequestsPage();
    }
    
    function initRequestsPage() {
        const searchQuery = localStorage.getItem('searchQuery');
        if (searchQuery) {
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                searchInput.value = searchQuery;
                if (typeof window.handleSearch === 'function') {
                    const event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    
                    Object.defineProperty(event, 'target', {
                        value: searchInput,
                        enumerable: true
                    });
                    
                    window.handleSearch(event);
                }
                
                localStorage.removeItem('searchQuery');
            }
        }
    }
});

// Approve a student's vacation request
window.approveRequest = function(studentId) {
    const studentsData = window.studentsData || [];
    
    if (!studentsData.length) {
        console.error('Student data not available');
        return;
    }
    
    const studentIndex = studentsData.findIndex(student => student.id === studentId);
    if (studentIndex === -1) {
        console.error(`Student with ID ${studentId} not found`);
        return;
    }
    
    studentsData[studentIndex].status = 'approved';
    
    if (typeof window.showNotification === 'function') {
        window.showNotification(`Request for ${studentsData[studentIndex].name} has been approved`, 'success');
    } else {
        alert(`Request for ${studentsData[studentIndex].name} has been approved`);
    }
    
    if (typeof window.renderStudents === 'function') {
        window.renderStudents(studentsData);
    }
};

// Deny a student's vacation request
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
