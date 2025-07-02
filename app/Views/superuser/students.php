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
                
                <div class="student-stats">
                  <div class="stat">
                    <span class="stat-label">Vacation Days</span>
                    <span class="stat-value"><?= htmlspecialchars($student['vacationDays']) ?></span>
                  </div>
                  <?php if ($student['latestRequest']): ?>
                    <div class="stat">
                      <span class="stat-label">Latest Request</span>
                      <span class="stat-value status-<?= htmlspecialchars($student['latestRequest']['status']) ?>">
                        <?= ucfirst(htmlspecialchars($student['latestRequest']['status'])) ?>
                      </span>
                    </div>
                  <?php endif; ?>
                </div>
                
                <?php if ($student['latestRequest']): ?>
                  <div class="request-info">
                    <div class="request-dates">
                      <i class="bi bi-calendar"></i>
                      <?= htmlspecialchars($student['latestRequest']['startDate']) ?> - 
                      <?= htmlspecialchars($student['latestRequest']['endDate']) ?>
                      <span class="request-days">(<?= htmlspecialchars($student['latestRequest']['days']) ?> days)</span>
                    </div>
                    <div class="request-reason">
                      <i class="bi bi-chat-left-text"></i>
                      <?= htmlspecialchars($student['latestRequest']['reason']) ?>
                    </div>
                    <?php if ($student['latestRequest']['status'] === 'pending'): ?>
                      <div class="request-actions">
                        <button class="btn btn-success btn-sm" onclick="approveRequest('<?= htmlspecialchars($student['latestRequest']['id']) ?>')">
                          <i class="bi bi-check-circle"></i> Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="denyRequest('<?= htmlspecialchars($student['latestRequest']['id']) ?>')">
                          <i class="bi bi-x-circle"></i> Deny
                        </button>
                      </div>
                    <?php endif; ?>
                  </div>
                <?php else: ?>
                  <div class="no-requests">
                    <i class="bi bi-inbox"></i>
                    <span>No recent requests</span>
                  </div>
                <?php endif; ?>
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
  </body>
</html>
