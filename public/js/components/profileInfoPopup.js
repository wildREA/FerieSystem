function showProfileModal() {
    
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "modal-backdrop fade show";
    modalBackdrop.style.zIndex = "1040";

    
    // Fetch current user data from API
    fetch('/api/auth-status')
        .then(response => {
            
            
            
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get the response text first to see what we're actually getting
            return response.text().then(text => {
                
                try {
                    return JSON.parse(text);
                } catch (parseError) {
                    console.error('ProfileInfoPopup: JSON parse error:', parseError);
                    console.error('ProfileInfoPopup: Raw text that failed to parse:', text);
                    throw new Error('Invalid JSON response: ' + text);
                }
            });
        })
        .then(data => {
            
            if (data.authenticated) {
                const currentUser = {
                    name: data.name || "User",
                    id: data.userId || "N/A",
                    email: data.email || "No email",
                    username: data.username || "No username",
                    role: data.userType === 'super' ? "Administrator" : "Student",
                    accessLevel: data.userType === 'super' ? "Super User" : "Standard User",
                    status: "Online",
                    lastLogin: "Today"
                };
                
                
                createProfileModal(currentUser, modalBackdrop);
            } else {
                
                // User not authenticated, redirect to login
                window.location.href = '/auth';
            }
        })
        .catch(error => {
            console.error('ProfileInfoPopup: Error fetching user data:', error);
            // Fallback with basic data
            const currentUser = {
                name: "User",
                id: "N/A",
                email: "No email",
                username: "No username",
                role: "User",
                accessLevel: "Standard User",
                status: "Online",
                lastLogin: "Today"
            };
            createProfileModal(currentUser, modalBackdrop);
        });
}

function createProfileModal(currentUser, modalBackdrop) {
    
    const modal = document.createElement("div");
    modal.className = "modal fade show";
    modal.style.display = "block";
    modal.style.zIndex = "1050";
    
    modal.innerHTML = 
        '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content" style="background-color: #232838;">' +
                '<div class="modal-header">' +
                    '<h5 class="modal-title">' + __('profile_information') + '</h5>' +
                    '<button type="button" class="btn-close" onclick="closeProfileModal()"></button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div class="row">' +
                        '<div class="col-md-4 text-center">' +
                            '<div class="profile-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 15px; background-color: #0d6efd; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">' +
                                '<i class="bi bi-person"></i>' +
                            '</div>' +
                            '<h4 class="mb-1 non-selectable">' + currentUser.name + '</h4>' +
                            '<p class="text-muted mb-2 selectable-text">ID: ' + currentUser.id + '</p>' +
                            '<button class="btn btn-outline-danger btn-sm" onclick="logout()">' +
                                '<i class="bi bi-box-arrow-right me-1"></i> Logout' +
                            '</button>' +
                        '</div>' +
                        '<div class="col-md-8">' +
                            '<div class="mb-4">' +
                                '<h6 class="text-primary mb-3"><i class="bi bi-person-circle me-2"></i>' + __('account_information') + '</h6>' +
                                '<div class="row">' +
                                    '<div class="col-6">' +
                                        '<small class="text-muted">Email</small>' +
                                        '<div class="fw-medium selectable-text" style="cursor: pointer;" onclick="copyToClipboard(\'' + currentUser.email + '\')">' +
                                            currentUser.email +
                                            '<i class="bi bi-clipboard ms-1" style="font-size: 0.8rem; opacity: 0.7;"></i>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="col-3">' +
                                        '<small class="text-muted">Role</small>' +
                                        '<div class="fw-medium selectable-text">' + currentUser.role + '</div>' +
                                    '</div>' +
                                    '<div class="col-3">' +
                                        '<small class="text-muted">Access Level</small>' +
                                        '<div class="fw-medium selectable-text">' + currentUser.accessLevel + '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="row mt-3">' +
                                    '<div class="col-6">' +
                                        '<small class="text-muted">Status</small>' +
                                        '<div class="fw-medium">' +
                                            '<span class="badge bg-success">' + currentUser.status + '</span>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="col-6">' +
                                        '<small class="text-muted">Last Login</small>' +
                                        '<div class="fw-medium selectable-text">' + currentUser.lastLogin + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="mb-4">' +
                                '<h6 class="text-primary mb-3"><i class="bi bi-lightning me-2"></i>Quick Actions</h6>' +
                                '<div class="d-flex gap-2 flex-wrap">' +
                                    '<button class="btn btn-outline-light btn-sm" onclick="showFriendsList()">' +
                                        '<i class="bi bi-people me-1"></i> Friends List' +
                                    '</button>' +
                                    '<button class="btn btn-outline-info btn-sm" onclick="showSettings()">' +
                                        '<i class="bi bi-gear me-1"></i> Settings' +
                                    '</button>' +
                                    '<button class="btn btn-outline-warning btn-sm" onclick="showNotifications()">' +
                                        '<i class="bi bi-bell me-1"></i> Notifications' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-secondary" onclick="closeProfileModal()">Close</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);

    
    
    // Store references for cleanup
    window.currentProfileModal = modal;
    window.currentProfileModalBackdrop = modalBackdrop;
}

function closeProfileModal() {
    if (window.currentProfileModal) {
        document.body.removeChild(window.currentProfileModal);
        window.currentProfileModal = null;
    }
    if (window.currentProfileModalBackdrop) {
        document.body.removeChild(window.currentProfileModalBackdrop);
        window.currentProfileModalBackdrop = null;
    }
}

// Placeholder functions for button functionality (no functionality yet as requested)
function showFriendsList() {
    
    // TODO: Implement friends list functionality
}

function logout() {
    // Close the profile modal first
    closeProfileModal();
    
    // Call the logout API which handles:
    // - PHP session cookie destruction
    // - Removal of all remember me tokens for the user from database by user id
    fetch('/api/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin' // Include cookies for session management
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            console.error('Logout failed:', response.status);
            // If server response is not OK, just refresh the page
            window.location.reload();
            throw new Error('Logout request failed');
        }
    })
    .then(data => {
        
        
        // Handle the response based on the server's instructions
        if (data.action === 'refresh') {
            window.location.reload();
        } else if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        } else {
            // Default fallback - just reload the page
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Refresh the page as fallback
        window.location.reload();
    });
}

function showSettings() {
    
    // TODO: Implement settings functionality
}

function showNotifications() {
    
    // TODO: Implement notifications functionality
}

// Utility function for copying text to clipboard (if not already defined)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        
        // Could add a toast notification here
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
    });
}

// Close modal when clicking outside or pressing escape
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-backdrop')) {
        closeProfileModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && window.currentProfileModal) {
        closeProfileModal();
    }
});

// Initialize the profile popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        
        profileInfo.addEventListener('click', function(e) {
            
            e.preventDefault();
            e.stopPropagation();
            showProfileModal();
        });
    } else {
        console.error('ProfileInfoPopup: profileInfo element not found');
    }
});
