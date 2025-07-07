<?php require_once dirname(dirname(dirname(__DIR__))) . '/config/language_da.php'; ?>
<!DOCTYPE html>
<html>
  <head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="Graphic designer personnel management website" />
    <title><?= __('calendar') ?> - Ferie System</title>
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
          <div class="user-role"><?= __('teacher') ?></div>
        </div>
        <ul class="nav-menu">
          <li class="nav-section">
            <a href="<?= url('/requests') ?>" class="section-link">
              <div class="section-header requests-background">
                <i class="bi bi-file-earmark-text text-danger"></i>
                <span><?= __('requests') ?></span>
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
                <span><?= __('students') ?></span>
              </div>
            </a>
          </li>
          <li class="nav-section active">
            <a href="<?= url('/calendar') ?>" class="section-link">
              <div class="section-header bounties-background">
                <i class="bi bi-cash-coin text-success"></i>
                <span><?= __('calendar') ?></span>
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
            <input type="text" id="studentSearch" placeholder="<?= __('search_requests') ?>..." class="form-control search-input">
            <div id="searchResults" class="search-results"></div>
          </div>
        </div>
        <div class="user-actions d-flex align-items-center" id="profileInfo" style="cursor: pointer;">
          <div class="me-3"><i class="bi bi-bell position-relative">
            <span class="notification-dot"></span>
          </i></div>
          <div class="d-flex align-items-center">
            <span class="me-2"><?= strtoupper(__('teacher')) ?></span>
            <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
              <i class="bi bi-person text-white"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <div class="content-header">
          <h2><?= __('calendar') ?></h2>
          <p class="text-muted"><?= __('calendar_upload_description') ?></p>
        </div>
        
        <div class="calendar-container">
          <!-- Upload section -->
          <div class="upload-section mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title"><?= __('upload_calendar_pdf') ?></h5>
                <p class="card-text text-muted"><?= __('upload_latest_calendar') ?></p>
                
                <div class="mt-3 d-flex align-items-center">
                  <div class="input-group me-3">
                    <input type="file" class="form-control" id="calendarPdfUpload" accept=".pdf">
                    <button class="btn btn-primary" type="button" id="uploadButton">
                      <i class="bi bi-cloud-upload me-2"></i><?= __('upload') ?>
                    </button>
                  </div>
                  
                  <button class="btn btn-outline-danger" type="button" id="removeCalendarButton">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                
                <div class="mt-3" id="uploadStatus" style="display: none;">
                  <div class="alert alert-success">
                    <i class="bi bi-check-circle me-2"></i>
                    <span id="uploadStatusText"><?= __('calendar_uploaded_successfully') ?></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- PDF viewer section -->
          <div class="pdf-viewer-section">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title d-flex justify-content-between align-items-center">
                  <span><?= __('calendar_preview') ?></span>
                </h5>
                
                <!-- PDF viewer container -->
                <div class="pdf-container mt-3" id="pdfContainer">
                  <!-- Default message when no PDF is uploaded -->
                  <div class="text-center py-5" id="noPdfMessage">
                    <i class="bi bi-file-earmark-pdf fs-1 text-muted"></i>
                    <h4 class="mt-3 text-muted"><?= __('no_calendar_uploaded') ?></h4>
                    <p class="text-muted"><?= __('upload_pdf_to_preview') ?></p>
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
    <script src="<?= asset('public/js/translations.js') ?>" defer></script>
    <script src="<?= asset('public/js/super/calendar.js') ?>" defer></script>
  </body>
</html>
