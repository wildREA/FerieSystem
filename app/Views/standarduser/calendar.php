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
    <link rel="stylesheet" href="<?= asset('public/css/super/calendar.css') ?>">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
    <script src="<?= asset('public/js/components/NotificationManager.js') ?>" defer></script>
    <script src="<?= asset('public/js/components/profileInfoPopup.js') ?>" defer></script>
    <script src="<?= asset('public/js/super/dashboard.js') ?>" defer></script>
    <!-- Hidden input to identify current page -->
    <input type="hidden" id="currentPage" value="requests">
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
          <div class="user-role">user</div>
        </div>
        <ul class="nav-menu">
          <li class="nav-section">
            <a href="<?= url('/requests') ?>" class="section-link">
              <div class="section-header requests-background">
                <i class="bi bi-file-earmark-text text-danger"></i>
                <span>Requests</span>
                <?php if (isset($notifications['pendingRequests']) && $notifications['pendingRequests'] > 0): ?>
                <span class="notification-badge"><?= $notifications['pendingRequests'] ?></span>
                <?php endif; ?>
              </div>
            </a>
          </li>
          <li class="nav-section">
            <a href="<?= url('/students') ?>" class="section-link">
              <div class="section-header students-background">
                <i class="bi bi-people text-primary"></i>
                <span>Students</span>
              </div>
            </a>
          </li>
          <li class="nav-section active">
            <a href="<?= url('/calendar') ?>" class="section-link">
              <div class="section-header bounties-background">
                <i class="bi bi-cash-coin text-success"></i>
                <span>Calendar</span>
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
        <div class="user-actions d-flex align-items-center" id="profileInfo" style="cursor: pointer;">
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
          <h2>Calendar</h2>
          <p class="text-muted">This page allows instructors to upload a PDF version of the calendar for students to plan their requests accordingly</p>
        </div>
        
        <div class="calendar-container">          
          <!-- PDF viewer section -->
          <div class="pdf-viewer-section">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title d-flex justify-content-between align-items-center">
                  <span>Calendar Preview</span>
                </h5>
                
                <!-- PDF viewer container -->
                <div class="pdf-container mt-3" id="pdfContainer">
                  <!-- Default message when no PDF is uploaded -->
                  <div class="text-center py-5" id="noPdfMessage">
                    <i class="bi bi-file-earmark-pdf fs-1 text-muted"></i>
                    <h4 class="mt-3 text-muted">No Calendar PDF Uploaded</h4>
                    <p class="text-muted">Upload a PDF to see the preview here</p>
                  </div>
                  
                  <!-- PDF embed will be shown here when a file is uploaded -->
                  <div id="pdfEmbed" style="display: none;">
                    <!-- The iframe will be created dynamically in JavaScript -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add JavaScript for PDF handling -->
    <script src="js/calendar.js" defer></script>
  </body>
</html>
