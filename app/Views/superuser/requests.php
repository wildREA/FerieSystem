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
                <span class="notification-badge user-select-none"<?= $pendingCount > 0 ? '' : ' style="display: none;"' ?>><?= $pendingCount ?></span>
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
            <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
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
        
        <?php
        // Helper function to generate avatar initials
        function generateAvatar($name, $username) {
            $displayName = $name ?: $username ?: 'Unknown User';
            $nameWords = explode(' ', $displayName);
            if (count($nameWords) >= 2) {
                return strtoupper(substr($nameWords[0], 0, 1) . substr($nameWords[1], 0, 1));
            }
            return strtoupper(substr($displayName, 0, 2));
        }
        
        // Helper function to render pending request card
        function renderPendingRequestCard($request) {
            $startDate = new DateTime($request['start_datetime']);
            $endDate = new DateTime($request['end_datetime']);
            $createdDate = new DateTime($request['created_at']);
            $today = new DateTime();
            
            $daysSinceRequest = (int)$today->diff($createdDate)->days;
            $avatar = generateAvatar($request['name'], $request['username']);
            $displayName = $request['name'] ?: $request['username'];
            
            return '
            <div class="student-card" data-request-id="' . htmlspecialchars($request['id']) . '">
                <div class="student-header">
                    <div class="student-avatar status-' . htmlspecialchars($request['status']) . '">
                        ' . htmlspecialchars($avatar) . '
                    </div>
                    <div class="student-info">
                        <h4>' . htmlspecialchars($displayName) . '</h4>
                        <p class="student-id">ID: ' . htmlspecialchars($request['id']) . '</p>
                    </div>
                </div>
                
                <div class="student-details">
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">' . htmlspecialchars($request['request_type']) . '</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Start Date:</span>
                        <span class="detail-value">' . htmlspecialchars($startDate->format('M j, Y')) . '</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">End Date:</span>
                        <span class="detail-value">' . htmlspecialchars($endDate->format('M j, Y')) . '</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="status-badge status-' . htmlspecialchars($request['status']) . '">' . htmlspecialchars($request['status']) . '</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Hours:</span>
                        <span class="detail-value">' . htmlspecialchars($request['total_hours']) . ' hours</span>
                    </div>' . 
                    (!empty($request['reason']) ? '
                    <div class="detail-row">
                        <span class="detail-label">Reason:</span>
                        <span class="detail-value request-reason">' . htmlspecialchars($request['reason']) . '</span>
                    </div>' : '') . '
                </div>
                
                <div class="student-card-footer">
                    <div class="days-remaining">
                        ' . $daysSinceRequest . ' days ago • Ends: ' . htmlspecialchars($endDate->format('M j, Y')) . '
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm me-2" onclick="approveRequest(\'' . htmlspecialchars($request['id']) . '\')">
                            <i class="bi bi-check-circle"></i> Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="denyRequest(\'' . htmlspecialchars($request['id']) . '\')">
                            <i class="bi bi-x-circle"></i> Deny
                        </button>
                    </div>
                </div>
            </div>';
        }
        
        // Helper function to render approved request card
        function renderApprovedRequestCard($request) {
            $startDate = new DateTime($request['start_datetime']);
            $endDate = new DateTime($request['end_datetime']);
            $today = new DateTime();
            
            $avatar = generateAvatar($request['name'], $request['username']);
            $displayName = $request['name'] ?: $request['username'];
            
            // Determine status and time description
            $statusClass = 'approved';
            $timeDescription = '';
            
            if ($startDate > $today) {
                $daysUntilStart = (int)$today->diff($startDate)->days;
                $timeDescription = "Starts in {$daysUntilStart} days";
                $statusClass = 'pending-start';
            } elseif ($endDate >= $today) {
                $daysRemaining = (int)$today->diff($endDate)->days + 1;
                $timeDescription = "{$daysRemaining} days remaining";
                $statusClass = 'active';
            } else {
                $daysSinceEnd = (int)$endDate->diff($today)->days;
                $timeDescription = "Completed {$daysSinceEnd} days ago";
                $statusClass = 'inactive';
            }
            
            $badgeText = $statusClass === 'active' ? 'Active' : 
                        ($statusClass === 'inactive' ? 'Completed' : 'Approved');
            
            return '
            <div class="request-card ' . $statusClass . '" data-request-id="' . htmlspecialchars($request['id']) . '">
                <span class="request-status-badge ' . $statusClass . '">' . $badgeText . '</span>
                
                <div class="student-header">
                    <div class="student-avatar status-approved" style="width: 40px; height: 40px;">
                        ' . htmlspecialchars($avatar) . '
                    </div>
                    <div class="student-info">
                        <h4>' . htmlspecialchars($displayName) . '</h4>
                        <p class="student-id">ID: ' . htmlspecialchars($request['id']) . '</p>
                    </div>
                </div>
                
                <div class="request-dates mt-3">
                    <div class="date-block">
                        <div class="date-label">Start Date</div>
                        <div class="date-value">' . htmlspecialchars($startDate->format('M j, Y')) . '</div>
                    </div>
                    <div class="date-block">
                        <div class="date-label">End Date</div>
                        <div class="date-value">' . htmlspecialchars($endDate->format('M j, Y')) . '</div>
                    </div>
                    <div class="date-block">
                        <div class="date-label">Hours</div>
                        <div class="date-value">' . htmlspecialchars($request['total_hours']) . '</div>
                    </div>
                </div>' . 
                (!empty($request['reason']) ? '
                
                <div class="mt-3">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value request-reason">' . htmlspecialchars($request['reason']) . '</div>
                </div>' : '') . '
                
                <div class="mt-3 text-end">
                    <small class="text-muted">' . $timeDescription . '</small>
                </div>
                
                <div class="mt-3 d-flex justify-content-end">
                    <button class="btn btn-outline-primary btn-sm" onclick="viewRequestDetails(\'' . htmlspecialchars($request['id']) . '\')">
                        <i class="bi bi-eye"></i> Details
                    </button>
                </div>
            </div>';
        }
        
        // Separate requests by status
        $pendingRequests = array_filter($requests ?? [], function($req) { return $req['status'] === 'pending'; });
        $approvedRequests = array_filter($requests ?? [], function($req) { return $req['status'] === 'approved'; });
        $pendingCount = count($pendingRequests);
        ?>
        
        <div class="students-grid" id="studentsGrid">
          <?php if (!empty($pendingRequests)): ?>
            <?php foreach ($pendingRequests as $request): ?>
              <?= renderPendingRequestCard($request) ?>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
        
        <div class="no-results" id="noResults" <?= empty($pendingRequests) ? '' : 'style="display: none;"' ?>>
          <div class="text-center py-5">
            <i class="bi bi-search fs-1 text-muted"></i>
            <h4 class="mt-3 text-muted user-select-none">No pending requests found</h4>
            <p class="text-muted user-select-none">There are currently no pending requests to review</p>
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
            <?php if (!empty($approvedRequests)): ?>
              <?php foreach ($approvedRequests as $request): ?>
                <?= renderApprovedRequestCard($request) ?>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
          
          <?php
          // Check if we have any active requests to determine if we should show no results
          $today = new DateTime();
          $hasActiveRequests = !empty(array_filter($approvedRequests, function($req) use ($today) {
              $endDate = new DateTime($req['end_datetime']);
              return $endDate >= $today;
          }));
          ?>
          
          <div class="no-approved-results" id="noApprovedResults" <?= $hasActiveRequests ? 'style="display: none;"' : '' ?>>
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
