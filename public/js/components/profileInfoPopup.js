// Profile Info Popup Component
// Based on showStudentModal function, modified for user profile

function showProfileModal() {
    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "modal-backdrop fade show";
    modalBackdrop.style.zIndex = "1040";

    // Get current user info (this would normally come from session/auth)
    const currentUser = {
        name: "Super User",
        id: "ADMIN001",
        email: "admin@feriesystem.dk",
        role: "Administrator",
        accessLevel: "Super User",
        status: "Online",
        lastLogin: "Today"
    };

    // Create modal
    const modal = document.createElement("div");
    modal.className = "modal fade show";
    modal.style.display = "block";
    modal.style.zIndex = "1050";
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="background-color: #232838;">
                <div class="modal-header">
                    <h5 class="modal-title">Profile Information</h5>
                    <button type="button" class="btn-close" onclick="closeProfileModal()"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4 text-center">
                            <div class="profile-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 15px; background-color: #0d6efd; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="bi bi-person"></i>
                            </div>
                            <h4 class="mb-1 non-selectable">${currentUser.name}</h4>
                            <p class="text-muted mb-2 selectable-text">${currentUser.id}</p>
                            <button class="btn btn-outline-danger btn-sm" onclick="logout()">
                                <i class="bi bi-box-arrow-right me-1"></i> Logout
                            </button>
                        </div>
                        <div class="col-md-8">
                            <div class="mb-4">
                                <h6 class="text-primary mb-3"><i class="bi bi-person-circle me-2"></i>Account Information</h6>
                                <div class="row">
                                    <div class="col-6">
                                        <small class="text-muted">Email</small>
                                        <div class="fw-medium selectable-text" style="cursor: pointer;" onclick="copyToClipboard('${currentUser.email}')">
                                            ${currentUser.email}
                                            <i class="bi bi-clipboard ms-1" style="font-size: 0.8rem; opacity: 0.7;"></i>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <small class="text-muted">Role</small>
                                        <div class="fw-medium selectable-text">${currentUser.role}</div>
                                    </div>
                                    <div class="col-3">
                                        <small class="text-muted">Access Level</small>
                                        <div class="fw-medium selectable-text">${currentUser.accessLevel}</div>
                                    </div>
                                </div>
                                <div class="row mt-3">
                                    <div class="col-6">
                                        <small class="text-muted">Status</small>
                                        <div class="fw-medium">
                                            <span class="badge bg-success">${currentUser.status}</span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted">Last Login</small>
                                        <div class="fw-medium selectable-text">${currentUser.lastLogin}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Quick Actions Section -->
                            <div class="mb-4">
                                <h6 class="text-primary mb-3"><i class="bi bi-lightning me-2"></i>Quick Actions</h6>
                                <div class="d-flex gap-2 flex-wrap">
                                    <button class="btn btn-outline-light btn-sm" onclick="showFriendsList()">
                                        <i class="bi bi-people me-1"></i> Friends List
                                    </button>
                                    <button class="btn btn-outline-info btn-sm" onclick="showSettings()">
                                        <i class="bi bi-gear me-1"></i> Settings
                                    </button>
                                    <button class="btn btn-outline-warning btn-sm" onclick="showNotifications()">
                                        <i class="bi bi-bell me-1"></i> Notifications
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeProfileModal()">Close</button>
                </div>
            </div>
        </div>
    `;

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
    console.log("Show Friends List - Not implemented yet");
    // TODO: Implement friends list functionality
}

function logout() {
    console.log("Logout - Not implemented yet");
    // TODO: Implement logout functionality
}

function showSettings() {
    console.log("Show Settings - Not implemented yet");
    // TODO: Implement settings functionality
}

function showNotifications() {
    console.log("Show Notifications - Not implemented yet");
    // TODO: Implement notifications functionality
}

// Utility function for copying text to clipboard (if not already defined)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Copied to clipboard: ' + text);
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

// Open modal when clicking on the profile info div
document.getElementById('profileInfo').addEventListener('click', function() {
    showProfileModal();
})
