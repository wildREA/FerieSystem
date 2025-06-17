<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Graphic designer personnel management website" />
    <title>Personnel Management Dashboard</title>
    <!-- Favicon -->
    <link rel="icon" href="../favicon/ico/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="../favicon/ico/favicon.ico" type="image/x-icon">
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="css/css-super/styles.css">
    <link rel="stylesheet" href="css/css-super/students.css">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
    <script src="js/super/dashboard.js" defer></script>
    <!-- Hidden input to identify current page -->
    <input type="hidden" id="currentPage" value="students">
  </head>
  <body>
    <div class="dashboard-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="logo" style="cursor: pointer;">FERIE SYSTEM</div>
        <div class="user-info">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="user-role">Super user</div>
        </div>
        <ul class="nav-menu">
          <li class="nav-section">
            <a href="requests.html" class="section-link">
              <div class="section-header requests-background">
                <i class="bi bi-file-earmark-text text-danger"></i>
                <span>Requests</span>
                <span class="notification-badge">2</span>
              </div>
            </a>
          </li>
          <li class="nav-section active">
            <a href="students.html" class="section-link">
              <div class="section-header students-background">
                <i class="bi bi-people text-primary"></i>
                <span>Students</span>
              </div>
            </a>
          </li>
          <li class="nav-section">
            <a href="calendar.html" class="section-link">
              <div class="section-header bounties-background">
                <i class="bi bi-cash-coin text-success"></i>
                <span>Calendar</span>
              </div>
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Top Header -->
      <div class="top-header">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input type="text" id="studentSearch" placeholder="Search students..." class="form-control search-input">
            <div id="searchResults" class="search-results"></div>
          </div>
        </div>
        <div class="user-actions d-flex align-items-center">
          <div class="me-3"><i class="bi bi-bell position-relative">
            <span class="notification-dot"></span>
          </i></div>
          <div class="d-flex align-items-center">
            <span class="me-2">SUPER USER</span>
            <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
              <i class="bi bi-person text-white"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <div class="content-header">
          <h2>Students Management</h2>
          <p class="text-muted">Manage student vacation requests and information</p>
        </div>
        
        <div class="students-grid" id="studentsGrid">
          <!-- Student cards will be generated here -->
        </div>
        
        <div class="no-results" id="noResults" style="display: none;">
          <div class="text-center py-5">
            <i class="bi bi-search fs-1 text-muted"></i>
            <h4 class="mt-3 text-muted">No students found</h4>
            <p class="text-muted">Try adjusting your search criteria</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
