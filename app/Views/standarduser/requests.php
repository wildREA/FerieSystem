<!DOCTYPE html>
<html lang="en">
<head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="View and track vacation requests" />
    <title>My Requests - FerieSystem</title>
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/css/standard/styles.css">
    <link rel="stylesheet" href="/css/standard/student-styles.css">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="/js/standard/common.js" defer></script>
    <script src="/js/standard/requests.js" defer></script>
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
                <div class="user-role">Student</div>
                <div class="user-name" id="studentName">Emma Nielsen</div>
            </div>
            <ul class="nav-menu">
                <li class="nav-section">
                    <a href="index.html" class="section-header">
                        <i class="bi bi-house-door text-primary"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-section">
                    <a href="<?= url('/new-request') ?>" class="section-header">
                        <i class="bi bi-plus-circle text-success"></i>
                        <span>New Request</span>
                    </a>
                </li>
                <li class="nav-section active">
                    <a href="<?= url('/standarduser/requests') ?>" class="section-header">
                        <i class="bi bi-clock-history text-warning"></i>
                        <span>My Requests</span>
                        <span class="notification-badge" id="requestsBadge">3</span>
                    </a>
                </li>
            </ul>
        </div>
        
        <!-- Top Header -->
        <div class="top-header">
            <div class="header-left">
                <h1 class="page-title" id="pageTitle">My Requests</h1>
                <p class="page-subtitle" id="pageSubtitle">View and track your vacation requests</p>
            </div>
            <div class="user-actions d-flex align-items-center">
                <div class="me-3">
                    <i class="bi bi-bell position-relative">
                        <span class="notification-dot" id="notificationDot" style="display: none;"></span>
                    </i>
                </div>
                <div class="d-flex align-items-center">
                    <span class="me-2" id="headerUserName">EMMA NIELSEN</span>
                    <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="bi bi-person text-white"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- My Requests View -->
            <div class="content-section active" id="requestsSection">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4>My Vacation Requests</h4>
                        <p class="text-muted mb-0">Track the status of your vacation requests</p>
                    </div>
                    <div class="d-flex gap-2">
                        <select class="form-select" id="statusFilter" style="width: auto;">
                            <option value="all">All Requests</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="denied">Denied</option>
                        </select>
                        <a href="<?= url('/new-request') ?>" class="btn btn-success">
                            <i class="bi bi-plus-circle me-2"></i>New Request
                        </a>
                    </div>
                </div>
                
                <div class="requests-grid" id="requestsGrid">
                    <!-- Request cards will be populated here -->
                </div>
            </div>
        </div>
    </div>
</body>
</html>
