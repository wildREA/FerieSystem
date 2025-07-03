// Create mock data for demonstration
window.studentsData = [
    {
        id: "STU001",
        name: "Emma Nielsen",
        email: "emma.nielsen@student.dk",
        course: "Graphic Design",
        year: 3,
        status: "pending",
        vacationDays: 25,
        requestDate: "2025-06-01",
        requestEndDate: "2025-06-16",
        requestDays: 5,
        requestReason: "Family vacation",
        avatar: "EN",
    },
    {
        id: "STU002", 
        name: "Lars Andersen",
        email: "lars.andersen@student.dk",
        course: "Engineering",
        year: 2,
        status: "approved",
        vacationDays: 30,
        requestDate: "2025-05-28",
        requestEndDate: "2025-05-31",
        requestDays: 3,
        requestReason: "Medical appointment",
        avatar: "LA",
    },
    {
        id: "STU003",
        name: "Sofia Larsen",
        email: "sofia.larsen@student.dk",
        course: "Business Administration",
        year: 1,
        status: "denied",
        vacationDays: 20,
        requestDate: "2025-06-05",
        requestEndDate: "2025-06-10",
        requestDays: 4,
        requestReason: "Personal reasons",
        avatar: "SL",
    },
    {
        id: "STU004",
        name: "Mikkel Jensen",
        email: "mikkel.jensen@student.dk",
        course: "Marketing",
        year: 2,
        status: "pending",
        vacationDays: 22,
        requestDate: "2025-06-08",
        requestEndDate: "2025-06-12",
        requestDays: 4,
        requestReason: "Conference attendance",
        avatar: "MJ",
    }
];

document.addEventListener("DOMContentLoaded", function() {
    // Check current page to determine functionality
    const currentPage = document.getElementById("currentPage")?.value || "students";
    
    init();

    function init() {
        updateNotificationBadges();
        setupEventListeners();
        
        // Refresh notifications when notification manager is available
        if (window.notificationManager) {
            window.notificationManager.refresh();
        }
    }

    function setupEventListeners() {
        // Update the sidebar logo to navigate to home
        const logo = document.querySelector(".sidebar .logo");
        if (logo) {
            logo.addEventListener("click", function () {
                window.location.href = "/students";
            });
        }

        // Listen for notifications updated event
        window.addEventListener('notificationsUpdated', function(event) {
            // Additional custom handling if needed
            console.log('Notifications updated:', event.detail.notifications);
        });
    }

    function updateNotificationBadges() {
        if (!window.studentsData) return;
        
        // Count pending requests
        const requestAmount = window.studentsData.filter(
            (student) => student.status === "pending"
        ).length;
        
        // Update all notification badges
        const notificationBadges = document.querySelectorAll(".notification-badge");
        notificationBadges.forEach(badge => {
            if (requestAmount > 0) {
                badge.textContent = requestAmount;
                badge.style.display = "inline-block";
            } else {
                badge.style.display = "none";
            }
        });
    }

    // Listen for request approval/denial events to refresh notifications
    window.addEventListener('requestStatusChanged', function() {
        updateNotificationBadges();
        
        // Refresh via notification manager if available
        if (window.notificationManager) {
            window.notificationManager.refresh();
        }
    });
});

// Override approve and deny functions to refresh notifications
const originalApproveRequest = window.approveRequest;
const originalDenyRequest = window.denyRequest;

window.approveRequest = function(requestId) {
    // Call original function if it exists
    if (originalApproveRequest) {
        originalApproveRequest(requestId);
    }
    
    // Trigger notification refresh
    setTimeout(() => {
        if (window.notificationManager) {
            window.notificationManager.refresh();
        }
        window.dispatchEvent(new CustomEvent('requestStatusChanged'));
    }, 1000); // Delay to allow server processing
};

window.denyRequest = function(requestId) {
    // Call original function if it exists
    if (originalDenyRequest) {
        originalDenyRequest(requestId);
    }
    
    // Trigger notification refresh
    setTimeout(() => {
        if (window.notificationManager) {
            window.notificationManager.refresh();
        }
        window.dispatchEvent(new CustomEvent('requestStatusChanged'));
    }, 1000); // Delay to allow server processing
};
