<?php
// Load helper functions
require_once dirname(__DIR__, 2) . '/Helpers/UrlHelper.php';
require_once dirname(__DIR__, 2) . '/Controllers/DashboardController.php';

// Instantiate the controller and get data
$dashboardController = new App\Controllers\DashboardController();
$userId = $_SESSION['user_id']; // Assuming user ID is in session
$balanceData = $dashboardController->getBalanceData($userId);
$transactionHistory = $dashboardController->getTransactionHistory($userId);
?>
<?php
// Test if helper functions work
if (function_exists('getCurrentUserName')) {
    $testUser = getCurrentUserName();
    echo "<!-- Test: getCurrentUserName() = " . htmlspecialchars($testUser) . " -->";
} else {
    echo "<!-- Test: getCurrentUserName function not found -->";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="Student vacation request management system" />
    <title>Dashboard - FerieSystem</title>
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= asset('public/css/standard/styles.css') ?>">
    <link rel="stylesheet" href="<?= asset('public/css/standard/student-styles.css') ?>">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="<?= asset('public/js/standard/dashboard.js') ?>" defer></script>
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
                <div class="user-name" id="studentName"><?php 
                    if (function_exists('getCurrentUserName')) {
                        echo getCurrentUserName();
                    } else {
                        echo 'User';
                    }
                ?></div>
            </div>
            <ul class="nav-menu">
                <li class="nav-section active">
                    <a href="<?= url('/dashboard') ?>" class="section-header">
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
                <li class="nav-section">
                    <a href="<?= url('/requests') ?>" class="section-header">
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
                <h1 class="page-title" id="pageTitle">Dashboard</h1>
                <p class="page-subtitle" id="pageSubtitle">Welcome back, manage your vacation requests</p>
            </div>
            <div class="user-actions d-flex align-items-center" onclick="alert('Construction in progress 🚧')" >
                <div class="d-flex align-items-center" onclick="alert('Construction in progress 🚧')">
                    <span  class="me-2" id="headerUserName"><?php 
                        if (function_exists('getCurrentUserName')) {
                            echo strtoupper(getCurrentUserName());
                        } else {
                            echo 'USER';
                        }
                    ?></span>
                    <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="bi bi-person text-white"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Dashboard View -->
            <div class="content-section active" id="dashboardSection">
                <!-- Stats Cards -->
                <div class="row mb-4">
                    <div class="col-auto mb-3">
                        <div class="stat-card blue clickable" id="balanceCard" data-bs-toggle="modal" data-bs-target="#balanceModal">
                            <div>
                                <div class="value"><?= htmlspecialchars($balanceData['currentBalance']) ?> timer</div>
                                <div class="label">Vacation Balance <small>(Click for details)</small></div>
                            </div>
                            <div class="icon">
                                <i class="bi bi-wallet2"></i>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                <!-- Recent Requests -->
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Recent Requests</h5>
                        <a href="<?= url('/requests') ?>" class="btn btn-outline-primary btn-sm">
                            View All
                        </a>
                    </div>
                    <div class="card-body">
                        <div id="recentRequestsList">
                            <!-- Recent requests will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="bi bi-lightning-charge me-2"></i>Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <a href="<?= url('/new-request') ?>" class="btn btn-success w-100">
                                    <i class="bi bi-plus-circle me-2"></i>
                                    New Request
                                </a>
                            </div>
                            <div class="col-md-6 mb-3">
                                <a href="<?= url('/requests') ?>" class="btn btn-warning w-100">
                                    <i class="bi bi-list-ul me-2"></i>
                                    My Requests
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Balance Modal -->
    <div class="modal fade" id="balanceModal" tabindex="-1" aria-labelledby="balanceModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h5 class="modal-title text-white" id="balanceModalLabel">
                        <i class="bi bi-calendar-range me-2"></i>Vacation Balance & History
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Usage History / Transaction History -->
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0"><i class="bi bi-graph-up me-2"></i>Usage History</h6>
                                </div>
                                <div class="card-body">
                                    <!-- Current Balance Summary -->
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="mb-2 text-muted small">Total Allocated</div>
                                            <div class="h5">₣<?= htmlspecialchars($balanceData['totalAllocated']) ?></div>
                                        </div>
                                        <div class="col-6">
                                            <div class="mb-2 text-muted small">Total Used</div>
                                            <div class="h5">₣<?= htmlspecialchars($balanceData['totalUsed']) ?></div>
                                        </div>
                                        <div class="col-6 mt-3">
                                            <div class="mb-2 text-muted small">Pending Requests</div>
                                            <div class="h5">₣<?= htmlspecialchars($balanceData['pendingHours']) ?></div>
                                        </div>
                                        <div class="col-6 mt-3">
                                            <div class="mb-2 text-muted small fw-bold">Current Available Balance</div>
                                            <div class="h5 fw-bold">₣<?= htmlspecialchars($balanceData['currentBalance']) ?></div>
                                        </div>
                                    </div>
                                    <h6 class="mb-3">Transaction History</h6>
                                    <!-- Transaction History (newest first) -->
                                    <div id="modalBalanceHistory">
                                        <?php foreach ($transactionHistory as $transaction) : ?>
                                            <div class="balance-history-item d-flex justify-content-between align-items-center py-2 border-bottom">
                                                <div class="history-info">
                                                    <div class="history-date small text-muted"><?= htmlspecialchars($transaction['date']) ?></div>
                                                    <div class="history-description"><?= htmlspecialchars($transaction['description']) ?></div>
                                                </div>
                                                <div class="history-amount <?= $transaction['amount'] > 0 ? 'positive text-success' : 'negative text-danger' ?>">
                                                    <?= $transaction['amount'] > 0 ? '+' : '' ?><?= htmlspecialchars($transaction['amount']) ?>ff
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                        <?php if (empty($transactionHistory)) : ?>
                                            <div class="text-muted small">No transactions found.</div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Balance Information -->
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Balance Information</h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <h6 class="text-muted">Annual Allocation</h6>
                                        <p class="mb-0 small">You are allocated 200ff vacation hours per academic year.</p>
                                    </div>
                                    <div class="mb-3">
                                        <h6 class="text-muted">Current Period</h6>
                                        <p class="mb-0 small">September 2024 - June 2025</p>
                                    </div>
                                    <div class="mb-3">
                                        <h6 class="text-muted">Rollover Policy</h6>
                                        <p class="mb-0 small">Unused hours do not carry over to the next academic year.</p>
                                    </div>
                                    <div class="mb-3">
                                        <h6 class="text-muted">Hour Calculation</h6>
                                        <p class="mb-0 small">8 hours = 1 working day. Weekend hours are tracked separately.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
