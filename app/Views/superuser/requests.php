<!DOCTYPE html>
<html>
  <head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="Graphic designer personnel management website" />
    <title>Requests Management - Ferie System</title>
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= asset('public/css/super/styles.css') ?>">
    <link rel="stylesheet" href="<?= asset('public/css/super/requests.css') ?>">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="<?= asset('public/js/super/dashboard.js') ?>" defer></script>
    <script src="<?= asset('public/js/super/requests.js') ?>" defer></script>
    <!-- Hidden input to identify current page -->
    <input type="hidden" id="currentPage" value="requests">
  </head>
  <body>
    <div class="dashboard-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="logo user-select-none" style="cursor: pointer;">FERIE SYSTEM</div>
        <div class="user-info">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="user-role user-select-none">Super user</div>
        </div>
        <ul class="nav-menu">
          <li class="nav-section active">
            <a href="<?= url('/requests') ?>" class="section-link">
              <div class="section-header requests-background">
                <i class="bi bi-file-earmark-text text-danger"></i>
                <span class="user-select-none">Requests</span>
                <span class="notification-badge user-select-none">2</span>
              </div>
            </a>
          </li>
          <li class="nav-section">
            <a href="<?= url('/students') ?>" class="section-link">
              <div class="section-header students-background">
                <i class="bi bi-people text-primary"></i>
                <span class="user-select-none">Students</span>
              </div>
            </a>
          </li>
          <li class="nav-section">
            <a href="<?= url('/calendar') ?>" class="section-link">
              <div class="section-header bounties-background">
                <i class="bi bi-cash-coin text-success"></i>
                <span class="user-select-none">Calendar</span>
              </div>
            </a>
          </li>
        </ul>
        <?php include dirname(__DIR__) . '/components/key_container.php'; ?>
      </div>
      
      <!-- Top Header -->
      <div class="top-header">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input type="text" id="studentSearch" placeholder="Search requests..." class="form-control search-input">
            <div id="searchResults" class="search-results"></div>
          </div>
        </div>
        <div class="user-actions d-flex align-items-center">
          <div class="me-3"><i class="bi bi-bell position-relative">
            <span class="notification-dot"></span>
          </i></div>
          <div class="d-flex align-items-center">
            <span class="me-2 user-select-none">SUPER USER</span>
            <div onclick="showProfileModal()" id="profileInfo" class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
              <i class="bi bi-person text-white"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <div class="content-header">
          <h2 class="user-select-none">Requests</h2>
          <p class="text-muted user-select-none">Manage pending and recent vacation requests</p>
        </div>
        
        <div class="students-grid" id="studentsGrid">
          <!-- Student request cards will be generated here -->
        </div>
        
        <div class="no-results" id="noResults" style="display: none;">
          <div class="text-center py-5">
            <i class="bi bi-search fs-1 text-muted"></i>
            <h4 class="mt-3 text-muted user-select-none">No requests found</h4>
            <p class="text-muted user-select-none">Try adjusting your search criteria</p>
          </div>
        </div>
        
        <!-- Divider -->
        <div class="divider"></div>

        <!-- Approved Requests Section -->
        <div class="content-header mt-4">
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="user-select-none">Approved Requests</h3>
            <div class="toggle-container">
              <span class="toggle-label me-2 user-select-none">Show:</span>
              <div class="btn-group" role="group" aria-label="Request status toggle">
                <button type="button" class="btn btn-sm btn-primary active user-select-none" id="activeRequestsBtn">Active</button>
                <button type="button" class="btn btn-sm btn-outline-primary user-select-none" id="inactiveRequestsBtn">Completed</button>
              </div>
            </div>
          </div>
          <p class="text-muted user-select-none">View and manage approved vacation requests</p>
        </div>
        
        <!-- Approved requests container -->
        <div id="approvedRequestsContainer">
          <div class="approved-requests-grid" id="approvedRequestsGrid">
            <!-- Approved request cards will be generated here -->
          </div>
          
          <div class="no-approved-results" id="noApprovedResults" style="display: none;">
            <div class="text-center py-4">
              <i class="bi bi-clipboard-check fs-1 text-muted"></i>
              <h4 class="mt-3 text-muted user-select-none">No approved requests found</h4>
              <p class="text-muted user-select-none">There are currently no approved requests to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
