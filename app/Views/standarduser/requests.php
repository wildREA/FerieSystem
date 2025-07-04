<?php
// Load helper functions
require_once dirname(__DIR__, 2) . '/Helpers/UrlHelper.php';

// Get requests data from route
$requests = $requests ?? [];
$userName = function_exists('getCurrentUserName') ? getCurrentUserName() : 'Student';
$requestCount = count($requests);
$pendingCount = count(array_filter($requests, function($r) { return $r['status'] === 'pending'; }));

function formatDateForDisplay($dateString) {
    $date = new DateTime($dateString);
    return $date->format('j/m/Y');
}

function formatDateTimeForDisplay($dateTimeString) {
    $dateTime = new DateTime($dateTimeString);
    return $dateTime->format('j/m/Y \a\t H:i');
}

function getStatusBadgeClass($status) {
    switch ($status) {
        case 'approved': return 'success';
        case 'denied': return 'danger';
        case 'pending': return 'warning';
        default: return 'secondary';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="View and track vacation requests" />
    <title>My Requests - FerieSystem</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/css/standard/styles.css">
    <link rel="stylesheet" href="/css/standard/student-styles.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</head>
<body>
    <div class="dashboard-container">
        <div class="sidebar">
            <div class="logo" style="cursor: pointer;">FERIE SYSTEM</div>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <div class="user-role">Student</div>
                <div class="user-name"><?= htmlspecialchars($userName) ?></div>
            </div>
            <ul class="nav-menu">
                <li class="nav-section">
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
                <li class="nav-section active">
                    <a href="<?= url('/requests') ?>" class="section-header">
                        <i class="bi bi-clock-history text-warning"></i>
                        <span>My Requests</span>
                        <?php if ($pendingCount > 0): ?>
                        <span class="notification-badge"><?= $pendingCount ?></span>
                        <?php endif; ?>
                    </a>
                </li>
            </ul>
        </div>

        <div class="top-header">
            <div class="header-left">
                <h1 class="page-title">My Requests</h1>
                <p class="page-subtitle">View and track your vacation requests</p>
            </div>
            <div class="user-actions d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <span class="me-2"><?= strtoupper(htmlspecialchars($userName)) ?></span>
                    <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="bi bi-person text-white"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="content-section active">
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
                    <?php if (empty($requests)): ?>
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="bi bi-calendar-x"></i>
                            </div>
                            <h5>No Requests Found</h5>
                            <p>You haven't submitted any vacation requests yet.</p>
                            <a href="<?= url('/new-request') ?>" class="btn btn-success">
                                <i class="bi bi-plus-circle me-2"></i>Submit Your First Request
                            </a>
                        </div>
                    <?php else: ?>
                        <?php foreach ($requests as $request): 
                            $hours = $request['total_hours'];
                            $days = $hours / 8;
                        ?>
                            <div class="request-card" data-status="<?= $request['status'] ?>">
                                <div class="request-header">
                                    <div class="request-duration">
                                        <strong><?= $hours ?></strong>ff (<?= number_format($days, 1) ?> day<?= $days != 1 ? 's' : '' ?>)
                                    </div>
                                    <div class="status-badge status-<?= $request['status'] ?>"><?= ucfirst($request['status']) ?></div>
                                </div>
                                <div class="request-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Start:</span>
                                        <span class="detail-value"><?= formatDateTimeForDisplay($request['start_datetime']) ?></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">End:</span>
                                        <span class="detail-value"><?= formatDateTimeForDisplay($request['end_datetime']) ?></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Submitted:</span>
                                        <span class="detail-value"><?= formatDateForDisplay($request['created_at']) ?></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Request ID:</span>
                                        <span class="detail-value"><?= str_pad($request['id'], 3, '0', STR_PAD_LEFT) ?></span>
                                    </div>
                                </div>
                                <div class="request-reason">
                                    <strong>Reason:</strong> <?= !empty($request['reason']) ? htmlspecialchars($request['reason']) : 'No reason provided' ?>
                                </div>
                                <?php if ($request['status'] === 'denied'): ?>
                                    <div class="alert alert-danger mt-2">
                                        <strong>Denied:</strong> Request was not approved
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const statusFilter = document.getElementById('statusFilter');
            const requestsGrid = document.getElementById('requestsGrid');
            
            statusFilter.addEventListener('change', function() {
                const selectedStatus = this.value;
                const requestCards = requestsGrid.querySelectorAll('.request-card');
                
                requestCards.forEach(card => {
                    if (selectedStatus === 'all' || card.dataset.status === selectedStatus) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    </script>
</body>
</html>
