<!DOCTYPE html>
<html>
  <head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="Graphic designer personnel management website" />
    <title>Personnel Management Dashboard</title>
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= asset('public/css/super/styles.css') ?>">
    <link rel="stylesheet" href="<?= asset('public/css/super/students.css') ?>">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
    <script src="<?= asset('public/js/components/NotificationManager.js') ?>" defer></script>
    <script src="<?= asset('public/js/components/profileInfoPopup.js') ?>" defer></script>
    <script src="<?= asset('public/js/super/students.js') ?>" defer></script>
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
          <li class="nav-section active">
            <a href="<?= url('/students') ?>" class="section-link">
              <div class="section-header students-background">
                <i class="bi bi-people text-primary"></i>
                <span>Students</span>
              </div>
            </a>
          </li>
          <li class="nav-section">
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
            <input type="text" id="studentSearch" placeholder="Search students..." class="form-control search-input">
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
          <h2>Students Management</h2>
          <p class="text-muted">Manage student vacation requests and information</p>
        </div>
        
        
        <div class="students-grid" id="studentsGrid">
          <!-- Students will be rendered server-side and enhanced with JavaScript -->
          <?php if (!empty($students)): ?>
            <?php foreach ($students as $student): ?>
              <div class="student-card" data-student-id="<?= htmlspecialchars($student['id']) ?>">
                <div class="student-header">
                  <div class="student-avatar">
                    <?= htmlspecialchars($student['avatar']) ?>
                  </div>
                  <div class="student-info">
                    <h4 class="student-name"><?= htmlspecialchars($student['name']) ?></h4>
                    <p class="student-email"><?= htmlspecialchars($student['email']) ?></p>
                    <div class="student-meta">
                      <span class="course"><?= htmlspecialchars($student['course']) ?></span>
                      <?php if ($student['year'] !== 'N/A'): ?>
                        <span class="year">Year <?= htmlspecialchars($student['year']) ?></span>
                      <?php endif; ?>
                    </div>
                  </div>
                </div>
                                
                
              </div>
            <?php endforeach; ?>
          <?php else: ?>
            <div class="no-students text-center py-5">
              <i class="bi bi-people fs-1 text-muted"></i>
              <h4 class="mt-3 text-muted">No students found</h4>
              <p class="text-muted">No students are registered in the system</p>
            </div>
          <?php endif; ?>
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

    <!-- FF Hours Adjustment Modal -->
    <div class="ff-hours-modal" id="ffHoursModal" style="display: none;">
        <div class="modal-content">
            <!-- Question mark icon -->
            <div class="modal-icon">
                <div class="question-circle">?</div>
            </div>
            
            <!-- Title -->
            <h2 class="modal-title">Adjust FF Hours</h2>
            
            <!-- Message -->
            <p class="modal-message">Are you sure you want to modify FF hours for this student?</p>
            
            <!-- Reason input field -->
            <div class="reason-field">
                <label for="ffReason">Reason:</label>
                <input type="text" id="ffReason" placeholder="Enter reason for adjustment..." required>
            </div>
            
            <!-- Action buttons -->
            <div class="modal-buttons">
                <button class="btn-confirm" onclick="confirmFFAdjustment()">
                    <span class="icon">✓</span>
                    Yes, adjust it!
                </button>
                <button class="btn-cancel" onclick="closeFFModal()">
                    <span class="icon">✕</span>
                    Cancel
                </button>
            </div>
        </div>
    </div>
    
    <style>
        /* FF Hours Modal Styles */
        .ff-hours-modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
        }

        .ff-hours-modal .modal-content {
            background-color: #2c3e50;
            margin: 15% auto;
            padding: 30px;
            border-radius: 10px;
            width: 400px;
            text-align: center;
            color: white;
        }

        .modal-icon .question-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid #5dade2;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 28px;
            color: #5dade2;
            font-weight: bold;
        }

        .ff-hours-modal .modal-title {
            color: white;
            margin-bottom: 15px;
            font-size: 24px;
            font-weight: bold;
        }

        .ff-hours-modal .modal-message {
            color: #bdc3c7;
            margin-bottom: 20px;
            font-size: 16px;
        }

        .reason-field {
            margin: 20px 0;
            text-align: left;
        }

        .reason-field label {
            display: block;
            margin-bottom: 8px;
            color: #ecf0f1;
            font-weight: 500;
        }

        .reason-field input {
            width: 100%;
            padding: 10px;
            border: 1px solid #34495e;
            border-radius: 5px;
            background-color: #34495e;
            color: white;
            font-size: 14px;
        }

        .reason-field input::placeholder {
            color: #95a5a6;
        }

        .modal-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 25px;
        }

        .btn-confirm {
            background-color: #27ae60;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-cancel {
            background-color: #7f8c8d;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-confirm:hover {
            background-color: #229954;
        }

        .btn-cancel:hover {
            background-color: #6c7b7d;
        }
    </style>
  </body>
</html>
