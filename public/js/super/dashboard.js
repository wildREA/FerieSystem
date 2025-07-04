 // Dashboard functionality for Student Management System
// Create a global variable to store student data that can be accessed by other scripts
window.studentsData = [];

// Function to access the students data from other scripts
window.getStudentsData = function() {
  return window.studentsData;
};

document.addEventListener("DOMContentLoaded", function () {
  // Hardcoded student data
  window.studentsData = [
    {
      id: "STU001",
      name: "Emma Nielsen",
      email: "emma.nielsen@student.dk",
      course: "Computer Science",
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
      id: "STU001",
      name: "Emma Nielsen",
      email: "emma.nielsen@student.dk",
      course: "Computer Science",
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
      requestEndDate: "2025-06-13",
      requestDays: 8,
      requestReason: "Summer internship",
      avatar: "SL",
    },
    {
      id: "STU004",
      name: "Mikkel Jensen",
      email: "mikkel.jensen@student.dk",
      course: "Mathematics",
      year: 4,
      status: "pending",
      vacationDays: 25,
      requestDate: "2025-06-08",
      requestEndDate: "2025-06-15",
      requestDays: 7,
      requestReason: "Conference attendance",
      avatar: "MJ",
    },
    {
      id: "STU005",
      name: "Anna Pedersen",
      email: "anna.pedersen@student.dk",
      course: "Psychology",
      year: 2,
      status: "approved",
      vacationDays: 30,
      requestDate: "2025-05-25",
      requestEndDate: "2025-05-29",
      requestDays: 4,
      requestReason: "Personal leave",
      avatar: "AP",
    },
    {
      id: "STU006",
      name: "Frederik Hansen",
      email: "frederik.hansen@student.dk",
      course: "Computer Science",
      year: 3,
      status: "pending",
      vacationDays: 25,
      requestDate: "2025-06-10",
      requestEndDate: "2025-06-16",
      requestDays: 6,
      requestReason: "Study abroad preparation",
      avatar: "FH",
    },
    // Add more approved requests for better demonstration
    {
      id: "STU007",
      name: "Jacob Møller",
      email: "jacob.moller@student.dk",
      course: "Economics",
      year: 2,
      status: "approved",
      vacationDays: 28,
      requestDate: "2025-06-12",
      requestEndDate: "2025-06-20",
      requestDays: 8,
      requestReason: "Family wedding",
      avatar: "JM",
    },
    {
      id: "STU008",
      name: "Sara Schmidt",
      email: "sara.schmidt@student.dk",
      course: "Computer Science",
      year: 3,
      status: "approved",
      vacationDays: 25,
      requestDate: "2025-06-04",
      requestEndDate: "2025-06-09",
      requestDays: 5,
      requestReason: "Tech conference",
      avatar: "SS",
    },
    {
      id: "STU009",
      name: "Thomas Nielsen",
      email: "thomas.nielsen@student.dk",
      course: "Physics",
      year: 4,
      status: "approved",
      vacationDays: 30,
      requestDate: "2025-05-20",
      requestEndDate: "2025-05-26",
      requestDays: 6,
      requestReason: "Research trip",
      avatar: "TN",
    },
    {
      id: "STU010",
      name: "Maria Johansen",
      email: "maria.johansen@student.dk",
      course: "Arts",
      year: 1,
      status: "approved",
      vacationDays: 25,
      requestDate: "2025-06-15",
      requestEndDate: "2025-06-25",
      requestDays: 10,
      requestReason: "Art exhibition abroad",
      avatar: "MJ",
    },
  ];

  // Initialize Fuse.js for fuzzy search
  const fuseOptions = {
    keys: ["name", "email", "course", "id"],
    threshold: 0.4,
    includeScore: true,
  };
  const fuse = new Fuse(window.studentsData, fuseOptions);

  // DOM elements
  const studentsGrid = document.getElementById("studentsGrid");
  const searchInput = document.getElementById("studentSearch");
  const searchResults = document.getElementById("searchResults");
  const noResults = document.getElementById("noResults");
  const navSections = document.querySelectorAll(".nav-section");

  // Approved requests elements
  const approvedRequestsGrid = document.getElementById("approvedRequestsGrid");
  const noApprovedResults = document.getElementById("noApprovedResults");
  const activeRequestsBtn = document.getElementById("activeRequestsBtn");
  const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");

  // Today's date for comparing request dates
  const today = new Date("2025-06-11"); // Using the specified date from context

  // Get current page
  const currentPage =
    document.getElementById("currentPage")?.value || "students";

  // Initialize the application
  init();

  function init() {
    // Check if we're on a page that needs student rendering
    const studentsGrid = document.getElementById("studentsGrid");

    // Load different data based on the current page
    if (currentPage === "students" && studentsGrid) {
      // Show all students
      renderStudents(window.studentsData);
    } else if (currentPage === "requests" && studentsGrid) {
      // Show only pending requests in the main grid
      const pendingStudents = window.studentsData.filter(
        (student) => student.status === "pending"
      );
      renderStudents(pendingStudents);

      // Initialize approved requests section
      if (approvedRequestsGrid) {
        initializeApprovedRequestsSection();
      }
    }

    setupEventListeners();
  }

  // Create a debounced version of handleSearch inside setupEventListeners
  function setupEventListeners() {
    // Debounce function to prevent excessive search calls
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Search functionality - only set up if search input exists
    if (searchInput && searchResults) {
      // Create debounced version here, after window.handleSearch is available
      const debouncedHandleSearch = debounce((e) => {
        if (typeof window.handleSearch === 'function') {
          window.handleSearch(e);
        }
      }, 300);
      
      searchInput.addEventListener("input", debouncedHandleSearch);
      searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) {
          searchResults.style.display = "block";
        }
      });

      // Hide search results when clicking outside
      document.addEventListener("click", (e) => {
        if (e.target && !e.target.closest(".search-wrapper")) {
          if (searchResults) {
            searchResults.style.display = "none";
          }
        }
      });

      // Set up keyboard navigation for search results
      searchInput.addEventListener("keydown", window.handleSearchNavigation);
    }

    // Update the sidebar logo to navigate to home
    const logo = document.querySelector(".sidebar .logo");
    if (logo) {
      logo.addEventListener("click", function () {
        window.location.href = "/students";
      });
    }

    // Set up toggle buttons for approved requests
    if (activeRequestsBtn && inactiveRequestsBtn) {
      activeRequestsBtn.addEventListener("click", () => {
        toggleApprovedRequestsView("active");
      });

      inactiveRequestsBtn.addEventListener("click", () => {
        toggleApprovedRequestsView("inactive");
      });
    }
  }

  /**
   * Initialize the approved requests section
   */
  function initializeApprovedRequestsSection() {
    // By default show active approved requests
    toggleApprovedRequestsView("active");
  }

  /**
   * Toggle between active and inactive approved requests
   * @param {string} view - 'active' or 'inactive'
   */
  function toggleApprovedRequestsView(view) {
    // Get button references dynamically in case they weren't available during initial load
    const activeRequestsBtn = document.getElementById("activeRequestsBtn");
    const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");
    
    // Only proceed if buttons exist
    if (!activeRequestsBtn || !inactiveRequestsBtn) {
      return;
    }

    // Update button styles - properly handle both btn-primary/btn-outline-primary and active class
    if (view === "active") {
      // Set active button styling
      activeRequestsBtn.classList.add("btn-primary", "active");
      activeRequestsBtn.classList.remove("btn-outline-primary");

      // Set inactive button styling
      inactiveRequestsBtn.classList.add("btn-outline-primary");
      inactiveRequestsBtn.classList.remove("btn-primary", "active");
    } else {
      // Set active button styling
      inactiveRequestsBtn.classList.add("btn-primary", "active");
      inactiveRequestsBtn.classList.remove("btn-outline-primary");

      // Set inactive button styling
      activeRequestsBtn.classList.add("btn-outline-primary");
      activeRequestsBtn.classList.remove("btn-primary", "active");
    }

    // Filter approved requests based on active status
    const approvedStudents = window.studentsData.filter(
      (student) => student.status === "approved"
    );

    // Determine if requests are active (end date is in the future) or inactive (completed)
    let filteredRequests;
    if (view === "active") {
      filteredRequests = approvedStudents.filter((student) => {
        const endDate = new Date(student.requestEndDate);
        return endDate >= today;
      });
    } else {
      filteredRequests = approvedStudents.filter((student) => {
        const endDate = new Date(student.requestEndDate);
        return endDate < today;
      });
    }

    renderApprovedRequests(filteredRequests, view);
  }

  /**
   * Render the approved requests in the grid
   * @param {Array} requests - The requests to render
   * @param {string} status - 'active' or 'inactive'
   */
  function renderApprovedRequests(requests, status) {
    const approvedRequestsGrid = document.getElementById("approvedRequestsGrid");
    const noApprovedResults = document.getElementById("noApprovedResults");
    
    if (!approvedRequestsGrid) return;
    
    if (requests.length === 0) {
      approvedRequestsGrid.style.display = 'none';
      if (noApprovedResults) {
        noApprovedResults.style.display = 'block';
      }
      return;
    }

    approvedRequestsGrid.style.display = 'grid';
    if (noApprovedResults) {
      noApprovedResults.style.display = 'none';
    }
    
    approvedRequestsGrid.innerHTML = requests.map(request => createApprovedRequestCard(request, status)).join('');
  }

  /**
   * Create an HTML card for an approved request
   * @param {Object} request - The request data
   * @param {string} status - 'active' or 'inactive'
   * @returns {string} HTML string for the request card
   */
  function createApprovedRequestCard(request, status) {
    const startDate = new Date(request.requestDate);
    const endDate = new Date(request.requestEndDate);
    
    // Calculate days remaining (for active requests) or days since completion (for inactive)
    let timeDescription;
    if (status === 'active') {
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      timeDescription = `${daysRemaining} days remaining`;
    } else {
      const daysSinceCompletion = Math.ceil((today - endDate) / (1000 * 60 * 60 * 24));
      timeDescription = `Completed ${daysSinceCompletion} days ago`;
    }
    
    return `
      <div class="request-card ${status}" data-request-id="${request.id}">
        <span class="request-status-badge ${status}">${status === 'active' ? 'Active' : 'Completed'}</span>
        
        <div class="student-header">
          <div class="student-avatar status-approved" style="width: 40px; height: 40px;">
            ${request.avatar}
          </div>
          <div class="student-info">
            <h4>${request.name}</h4>
            <p class="student-id">${request.id}</p>
          </div>
        </div>
        
        <div class="request-dates mt-3">
          <div class="date-block">
            <div class="date-label">Start Date</div>
            <div class="date-value">${startDate.toLocaleDateString()}</div>
          </div>
          <div class="date-block">
            <div class="date-label">End Date</div>
            <div class="date-value">${endDate.toLocaleDateString()}</div>
          </div>
          <div class="date-block">
            <div class="date-label">Days</div>
            <div class="date-value">${request.requestDays}</div>
          </div>
        </div>
        
        <div class="mt-3">
          <div class="detail-label">Reason:</div>
          <div class="detail-value">${request.requestReason}</div>
        </div>
        
        <div class="mt-3 text-end">
          <small class="text-muted">${timeDescription}</small>
        </div>
        
        <div class="mt-3 d-flex justify-content-end">
          <button class="btn btn-sm btn-outline-primary" onclick="viewDetails('${request.id}')">
            <i class="bi bi-eye"></i> Details
          </button>
        </div>
      </div>
    `;
  }

  // Track currently selected search result index
  let selectedSearchResultIndex = -1;

  /**
   * Handles keyboard navigation within search results
   * Allows navigating through search results using up/down arrow keys
   * and selecting with Enter
   * @param {KeyboardEvent} e - The keyboard event
   */
  window.handleSearchNavigation = function(e) {
    const resultItems = searchResults.querySelectorAll(".search-result-item");

    // Only handle navigation if search results are visible and there are results
    if (searchResults.style.display !== "block" || resultItems.length === 0) {
      return;
    }

    // Handle arrow up/down navigation
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); // Prevent cursor movement in the input

      // Remove highlight from currently selected item
      resultItems.forEach((item) => item.classList.remove("selected"));

      // Update the selected index based on arrow key
      if (e.key === "ArrowDown") {
        selectedSearchResultIndex =
          selectedSearchResultIndex < resultItems.length - 1
            ? selectedSearchResultIndex + 1
            : 0;
      } else if (e.key === "ArrowUp") {
        selectedSearchResultIndex =
          selectedSearchResultIndex > 0
            ? selectedSearchResultIndex - 1
            : resultItems.length - 1;
      }

      // Highlight the newly selected item
      const selectedItem = resultItems[selectedSearchResultIndex];
      selectedItem.classList.add("selected");

      // Make sure the selected item is visible in the dropdown
      selectedItem.scrollIntoView({ block: "nearest" });
    }

    // Handle Enter key to select the currently highlighted item
    if (e.key === "Enter" && selectedSearchResultIndex >= 0) {
      e.preventDefault();
      resultItems[selectedSearchResultIndex].click();
    }
  }

  window.handleSearch = function (e) {
    // Make sure e.target exists before accessing its properties
    if (!e || !e.target) {
      console.error("Invalid event or missing target in handleSearch");
      return;
    }
    
    const query = e.target.value.trim();
    const searchResults = document.getElementById("searchResults");

    if (!searchResults) {
      console.warn("searchResults element not found on this page");
      return;
    }

    if (query === "") {
      searchResults.style.display = "none";
      
      // Clear any existing highlights
      document.querySelectorAll(".student-card.highlighted, .request-card.highlighted").forEach((card) => {
        card.classList.remove("highlighted");
      });

      // Show appropriate data based on current page
      if (currentPage === "students") {
        renderStudents(window.studentsData);
      } else if (currentPage === "requests") {
        const pendingStudents = window.studentsData.filter(
          (student) => student.status === "pending"
        );
        renderStudents(pendingStudents);

        // Keep the approved requests section intact - check if buttons exist first
        const activeRequestsBtn = document.getElementById("activeRequestsBtn");
        const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");
        
        if (activeRequestsBtn && activeRequestsBtn.classList.contains("btn-primary")) {
          toggleApprovedRequestsView("active");
        } else if (inactiveRequestsBtn && inactiveRequestsBtn.classList.contains("btn-primary")) {
          toggleApprovedRequestsView("inactive");
        }
      }
      return;
    }

    // Perform fuzzy search on the appropriate dataset
    let dataToSearch = window.studentsData;
    let approvedDataToSearch = [];
    
    if (currentPage === "requests") {
      // For requests page, search both pending and approved requests
      dataToSearch = window.studentsData.filter(
        (student) => student.status === "pending"
      );
      approvedDataToSearch = window.studentsData.filter(
        (student) => student.status === "approved"
      );
    }

    const fuseForCurrentPage = new Fuse(dataToSearch, fuseOptions);
    const results = fuseForCurrentPage.search(query);
    const searchResultsData = results.map((result) => result.item);

    // Also search approved requests if on requests page
    let approvedSearchResults = [];
    if (currentPage === "requests" && approvedDataToSearch.length > 0) {
      const fuseForApproved = new Fuse(approvedDataToSearch, fuseOptions);
      const approvedResults = fuseForApproved.search(query);
      approvedSearchResults = approvedResults.map((result) => result.item);
    }

    // Update search dropdown - combine both pending and approved results for dropdown
    const combinedDropdownResults = currentPage === "requests" 
      ? [...searchResultsData, ...approvedSearchResults]
      : searchResultsData;
    updateSearchDropdown(combinedDropdownResults, query);

    // Update main grid (only pending requests)
    renderStudents(searchResultsData);

    // Keep the approved requests section visible if on requests page and filter them too
    if (currentPage === "requests") {
      const approvedRequestsGrid = document.getElementById("approvedRequestsGrid");
      const activeRequestsBtn = document.getElementById("activeRequestsBtn");
      const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");
      
      if (approvedRequestsGrid && activeRequestsBtn && inactiveRequestsBtn) {
        // Filter the approved search results based on active/inactive status
        const today = new Date("2025-06-11");
        let filteredApprovedResults;
        
        if (activeRequestsBtn.classList.contains("btn-primary")) {
          // Show active approved requests that match search
          filteredApprovedResults = approvedSearchResults.filter((student) => {
            const endDate = new Date(student.requestEndDate);
            return endDate >= today;
          });
          renderApprovedRequests(filteredApprovedResults, "active");
        } else {
          // Show inactive approved requests that match search
          filteredApprovedResults = approvedSearchResults.filter((student) => {
            const endDate = new Date(student.requestEndDate);
            return endDate < today;
          });
          renderApprovedRequests(filteredApprovedResults, "inactive");
        }
      }
    }
  };

  function updateSearchDropdown(results, query) {
    const searchResults = document.getElementById("searchResults");
    if (!searchResults) return;
    
    searchResults.innerHTML = "";
    // Reset the selected index when updating dropdown
    selectedSearchResultIndex = -1;

    const noResultsMessage =
      currentPage === "students" ? "No students found" : "No requests found";

    if (results.length === 0) {
      searchResults.innerHTML = `<div class="search-result-item">${noResultsMessage}</div>`;
    } else {
      results.slice(0, 8).forEach((student) => { // Show more results (8 instead of 5)
        const item = document.createElement("div");
        item.className = "search-result-item";
        
        // Add a status indicator for requests page
        const statusBadge = currentPage === "requests" ? 
          `<span class="badge badge-${student.status} ms-1">${student.status}</span>` : '';
        
        item.innerHTML = `
                    <div class="student-avatar status-${
                      student.status
                    }" style="width: 30px; height: 30px; font-size: 12px; margin-right: 10px;">
                        ${student.avatar}
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="font-weight: 600;">${highlightMatch(
                          student.name,
                          query
                        )}${statusBadge}</div>
                        <div style="font-size: 12px; color: #6c757d;">${
                          student.course
                        } - Year ${student.year}</div>
                    </div>
                `;

        item.addEventListener("click", () => {
          searchInput.value = student.name;
          searchResults.style.display = "none";
          
          // Handle different behaviors based on student status and current page
          if (currentPage === "requests") {
            if (student.status === "pending") {
              // Show only this pending student in main grid
              renderStudents([student]);
              highlightStudentCard(student.id);
            } else if (student.status === "approved") {
              // Show all pending students in main grid but highlight the approved request
              const pendingStudents = window.studentsData.filter(s => s.status === "pending");
              renderStudents(pendingStudents);
              
              // Also make sure the approved request is visible in the approved section
              const today = new Date("2025-06-11");
              const endDate = new Date(student.requestEndDate);
              const isActive = endDate >= today;
              
              // Switch to the appropriate tab
              const activeRequestsBtn = document.getElementById("activeRequestsBtn");
              const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");
              
              if (isActive && activeRequestsBtn) {
                activeRequestsBtn.click();
              } else if (!isActive && inactiveRequestsBtn) {
                inactiveRequestsBtn.click();
              }
              
              // Highlight the approved request card
              setTimeout(() => {
                highlightRequestCard(student.id);
              }, 200);
            }
          } else {
            // Students page behavior
            renderStudents([student]);
            highlightStudentCard(student.id);
          }
        });

        // Add mouseover event to update selectedSearchResultIndex
        item.addEventListener("mouseover", () => {
          // Remove highlight from all items
          searchResults
            .querySelectorAll(".search-result-item")
            .forEach((el, idx) => {
              if (el === item) selectedSearchResultIndex = idx;
              el.classList.remove("selected");
            });
          item.classList.add("selected");
        });

        searchResults.appendChild(item);
      });
    }

    searchResults.style.display = "block";
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }

  function highlightStudentCard(studentId) {
    // Remove existing highlights
    document.querySelectorAll(".student-card.highlighted, .request-card.highlighted").forEach((card) => {
      card.classList.remove("highlighted");
    });

    // Add highlight to specific card
    setTimeout(() => {
      const targetCard = document.querySelector(
        `[data-student-id="${studentId}"]`
      );
      if (targetCard) {
        targetCard.classList.add("highlighted");
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          targetCard.classList.remove("highlighted");
        }, 3000);
      }
    }, 100);
  }

  function highlightRequestCard(requestId) {
    // Remove existing highlights
    document.querySelectorAll(".student-card.highlighted, .request-card.highlighted").forEach((card) => {
      card.classList.remove("highlighted");
    });

    // Add highlight to specific request card
    setTimeout(() => {
      const targetCard = document.querySelector(
        `[data-request-id="${requestId}"]`
      );
      if (targetCard) {
        targetCard.classList.add("highlighted");
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          targetCard.classList.remove("highlighted");
        }, 3000);
      }
    }, 100);
  }

  function renderStudents(students) {
    // Get studentsGrid element and check if it exists
    const studentsGrid = document.getElementById("studentsGrid");
    const noResults = document.getElementById("noResults");

    // If studentsGrid doesn't exist on this page, exit the function
    if (!studentsGrid) {
      console.warn("studentsGrid element not found on this page");
      return;
    }

    if (students.length === 0) {
      studentsGrid.style.display = "none";
      if (noResults) {
        noResults.style.display = "block";
      }
      return;
    }

    studentsGrid.style.display = "grid";
    if (noResults) {
      noResults.style.display = "none";
    }

    // Use the appropriate card creation function based on the current page
    if (currentPage === "students") {
      studentsGrid.innerHTML = students
        .map((student) => createStudentsCard(student))
        .join("");
    } else if (currentPage === "requests") {
      studentsGrid.innerHTML = students
        .map((student) => createRequestsCard(student))
        .join("");
    }

    // Add event listeners to action buttons
    setupCardEventListeners();
  }

  function createRequestsCard(student) {
    const requestDate = new Date(student.requestDate);
    const requestEndDate = new Date(student.requestEndDate);
    const today = new Date();
    const daysSinceRequest = Math.floor(
      (today - requestDate) / (1000 * 60 * 60 * 24)
    );

    return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar status-${student.status}">
                        ${student.avatar}
                    </div>
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p class="student-id">${student.id}</p>
                    </div>
                </div>
                
                <div class="student-details">
                    <div class="detail-row">
                        <span class="detail-label">Course:</span>
                        <span class="detail-value">${student.course}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Year:</span>
                        <span class="detail-value">${student.year}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="status-badge status-${
                          student.status
                        }">${student.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Request End Date:</span>
                        <span class="detail-value">${requestEndDate.toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Requested:</span>
                        <span class="detail-value">${
                          student.requestDays
                        } days</span>
                    </div>
                </div>
                
                <div class="student-card-footer">
                    <div class="days-remaining">
                        ${daysSinceRequest} days ago • Ends: ${requestEndDate.toLocaleDateString()}
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewDetails('${
                          student.id
                        }')">
                            <i class="bi bi-eye"></i> Details
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  function createStudentsCard(student) {
    const requestDate = new Date(student.requestDate);
    const requestEndDate = new Date(student.requestEndDate);
    const today = new Date();
    const daysSinceRequest = Math.floor(
      (today - requestDate) / (1000 * 60 * 60 * 24)
    );

    return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar status-${student.status}">
                        ${student.avatar}
                    </div>
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p class="student-id">${student.id}</p>
                    </div>
                </div>
                <div class="mt-3 d-flex justify-content-end">
                    <div class="action-buttons">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewDetails('${student.id}')">
                            <i class="bi bi-eye"></i> Details
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  function setupCardEventListeners() {
    // No click handlers needed for student cards anymore
    // Only the Details buttons will trigger the modal
    const studentCards = document.querySelectorAll(".student-card");

    if (studentCards.length === 0) {
      return; // No cards to set up listeners for
    }

    // We're no longer adding click handlers to the entire card
    // Only the Details button triggers the modal through its onClick attribute
  }

  // Global functions for button actions
  window.viewDetails = function (studentId) {
    const student = window.studentsData.find((s) => s.id === studentId);
    if (student) {
      // Use different modal based on current page
      if (currentPage === "requests") {
        showRequestModal(student);
      } else {
        showStudentModal(student);
      }
    }
  };

  window.showNotification = function (message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText =
      "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  };
  
  // Function to copy text to clipboard
  window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        window.showNotification("Email copied to clipboard", "success");
      })
      .catch(err => {
        window.showNotification("Failed to copy email", "danger");
        console.error('Failed to copy text: ', err);
      });
  };

  function showStudentModal(student) {
    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "modal-backdrop fade show";
    modalBackdrop.style.zIndex = "1040";

    testFFvalue = 37;  // Test value for FF hours
    
    // Process email for display
    const truncatedEmail = student.email.length > 16 ? student.email.substring(0, 16) + '...' : student.email;
    const truncatedCourse = student.course.length > 12 ? student.course.substring(0, 12) + '...' : student.course;

    // Create modal
    const modal = document.createElement("div");
    modal.className = "modal fade show";
    modal.style.display = "block";
    modal.style.zIndex = "1050";
    modal.innerHTML = `
            <style>
                /* Hide number input arrows */
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            </style>
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background-color: #232838;">
                    <div class="modal-header">
                        <h5 class="modal-title">Student Details - ${student.name}</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="student-avatar status-${student.status}" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 15px;">
                                    ${student.avatar}
                                </div>
                                <h4 class="mb-1 non-selectable">${student.name}</h4>
                                <p class="text-muted mb-2 selectable-text">${student.id}</p>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-person-circle me-2"></i>Student Information</h6>
                                    <div class="row">
                                        <div class="col-5">
                                            <small class="text-muted">Email</small>
                                            <div class="fw-medium selectable-text text-truncate" title="${student.email}" style="cursor: pointer;" onclick="copyToClipboard('${student.email}')">
                                                ${truncatedEmail}
                                                <i class="bi bi-clipboard ms-1" style="font-size: 0.8rem; opacity: 0.7;"></i>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <small class="text-muted">Course</small>
                                            <div class="fw-medium selectable-text text-truncate" title="${student.course}" style="cursor: pointer" onclick="copyToClipboard('${student.course}')">
                                                ${truncatedCourse}
                                                <i class="bi bi-clipboard ms-1" style="font-size: 0.8rem; opacity: 0.7;"></i>
                                            </div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Year</small>
                                            <div class="fw-medium selectable-text">${student.year}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Notes Section -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-journal-text me-2"></i>Administrative Notes</h6>
                                    <div class="alert alert-light mb-0" style="background-color: #232838;">
                                        <textarea class="form-control border-0 bg-transparent"g placeholder="Add notes about this student here..." rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- FF Hours Section -->
                        <div class="mt-4 mb-3">
                            <h6 class="text-primary mb-3"><i class="bi bi-clock-history me-2"></i>FF Hours Management</h6>
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <div class="d-flex align-items-center">
                                        <span class="text-muted me-3">Current FF Hours:</span>
                                        <span class="fw-bold fs-5 text-muted">${testFFvalue}</span>
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <div class="d-flex align-items-center">
                                        <div class="input-group me-3" style="max-width: 150px;">
                                            <button class="btn btn-outline-light" style="background-color: #232838; border-color: #444a54;" type="button">-</button>
                                            <input type="number" class="form-control text-center" style="background-color: #1a1f2c; border-color: #444a54; color: #ffffff; border-left: none; border-right: none; -webkit-appearance: none; -moz-appearance: textfield;" value="1" min="1">
                                            <button class="btn btn-outline-light" style="background-color: #232838; border-color: #444a54;" type="button">+</button>
                                        </div>
                                        <button class="btn btn-outline-success me-2" style="color:#49dc35; border-color: #49dc35;">
                                            <i class="bi bi-plus-circle me-1"></i> Add
                                        </button>
                                        <button class="btn btn-outline-danger" style="color: #dc3545; border-color: #dc3545;">
                                            <i class="bi bi-dash-circle me-1"></i> Subtract
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="/requests" class="btn btn-primary" onclick="localStorage.setItem('searchQuery', '${student.name}');">
                            <i class="bi bi-list-check"></i> View All Requests
                        </a>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);

    // Store references for cleanup
    window.currentModal = modal;
    window.currentModalBackdrop = modalBackdrop;
  }

  function showRequestModal(student) {
    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "modal-backdrop fade show";
    modalBackdrop.style.zIndex = "1040";

    // Create modal
    const modal = document.createElement("div");
    modal.className = "modal fade show";
    modal.style.display = "block";
    modal.style.zIndex = "1050";
    modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background-color: #232838;">
                    <div class="modal-header">
                        <h5 class="modal-title">Student Details - ${
                          student.name
                        }</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="student-avatar status-${
                                  student.status
                                }" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 15px;">
                                    ${student.avatar}
                                </div>
                                <h4 class="mb-1 non-selectable">${
                                  student.name
                                }</h4>
                                <p class="text-muted mb-2 selectable-text">${
                                  student.id
                                }</p>
                            </div>
                            <div class="col-md-8">                                
                                <!-- Vacation Request Information -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-calendar-check me-2"></i>Vacation Request Details</h6>
                                    <div class="row mb-3">
                                        <div class="col-3">
                                            <small class="text-muted">Start Date</small>
                                            <div class="fw-medium selectable-text">${new Date(
                                              student.requestDate
                                            ).toLocaleDateString()}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">End Date</small>
                                            <div class="fw-medium selectable-text">${new Date(
                                              student.requestEndDate
                                            ).toLocaleDateString()}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Duration</small>
                                            <div class="fw-medium selectable-text">${
                                              student.requestDays
                                            } days</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Status</small>
                                            <div class="status-badge status-${
                                              student.status
                                            }">${student.status}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="alert alert-light mb-3" style="background-color: #232838;">
                                        <small class="text-muted d-block mb-1">Request Reason</small>
                                        <div class="selectable-text">${
                                          student.requestReason
                                        }</div>
                                    </div>
                                </div>
                                
                                <!-- Additional Student Information -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-info-circle me-2"></i>Additional Information</h6>
                                    <div class="row">
                                        <div class="col-6">
                                            <small class="text-muted">Total Vacation Days Available</small>
                                            <div class="fw-medium selectable-text">${
                                              student.vacationDays
                                            } days</div>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted">Previous Requests This Year</small>
                                            <div class="fw-medium selectable-text">
                                                <span class="badge bg-success me-1">Approved: 2</span>
                                                <span class="badge bg-danger me-1">Denied: 1</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${
                          student.status === "pending"
                            ? `
                            <button type="button" class="btn btn-success" onclick="approveRequest('${student.id}'); closeModal();">
                                <i class="bi bi-check"></i> Approve
                            </button>
                            <button type="button" class="btn btn-danger" onclick="denyRequest('${student.id}'); closeModal();">
                                <i class="bi bi-x"></i> Deny
                            </button>
                        `
                            : ""
                        }
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);

    // Store references for cleanup
    window.currentModal = modal;
    window.currentModalBackdrop = modalBackdrop;
  }

  window.closeModal = function () {
    if (window.currentModal) {
      window.currentModal.remove();
    }
    if (window.currentModalBackdrop) {
      window.currentModalBackdrop.remove();
    }
    window.currentModal = null;
    window.currentModalBackdrop = null;
  };

  // Close modal on backdrop click
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  // Add some nice animations on load
  setTimeout(() => {
    const cards = document.querySelectorAll(".student-card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";

      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }, 100);

  // Iterate through requests by amount and return the number of requests to .notification-badge
  const requestAmount = window.studentsData.filter(
    (student) => student.status === "pending"
  ).length;
  const notificationBadge = document.querySelector(".notification-badge");

  if (notificationBadge) {
    notificationBadge.textContent = requestAmount > 0 ? requestAmount : "";
    notificationBadge.style.display = requestAmount > 0 ? "block" : "none";
  }
});
