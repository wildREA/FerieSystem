<?php
// Load helper functions
require_once dirname(__DIR__, 2) . '/Helpers/UrlHelper.php';
require_once dirname(__DIR__, 2) . '/Helpers/LanguageHelper.php';

// Get requests data from route
$requests = $requests ?? [];
$userName = function_exists('getCurrentUserName') ? getCurrentUserName() : __('student');
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
<html lang="da">
<head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="<?= __('view_track_requests') ?>" />
    <title><?= __('my_requests') ?> - FerieSystem</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= asset('public/css/standard/styles.css') ?>">
    <link rel="stylesheet" href="<?= asset('public/css/standard/student-styles.css') ?>">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="<?= asset('public/js/translations.js') ?>" defer></script>
    <script src="<?= asset('public/js/components/profileInfoPopup.js') ?>" defer></script>
</head>
<body>
    <div class="dashboard-container">
        <div class="sidebar">
            <div class="logo" style="cursor: pointer;">FERIE SYSTEM</div>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <div class="user-role"><?= __('student') ?></div>
                <div class="user-name"><?= htmlspecialchars($userName) ?></div>
            </div>
            <ul class="nav-menu">
                <li class="nav-section">
                    <a href="<?= url('/dashboard') ?>" class="section-header">
                        <i class="bi bi-house-door text-primary"></i>
                        <span><?= __('dashboard') ?></span>
                    </a>
                </li>
                <li class="nav-section">
                    <a href="<?= url('/new-request') ?>" class="section-header">
                        <i class="bi bi-plus-circle text-success"></i>
                        <span><?= __('new_request') ?></span>
                    </a>
                </li>
                <li class="nav-section active">
                    <a href="<?= url('/requests') ?>" class="section-header">
                        <i class="bi bi-clock-history text-warning"></i>
                        <span><?= __('my_requests') ?></span>
                        <?php if ($pendingCount > 0): ?>
                        <span class="notification-badge"><?= $pendingCount ?></span>
                        <?php endif; ?>
                    </a>
                </li>
            </ul>
        </div>

        <div class="top-header">
            <div class="header-left">
                <h1 class="page-title"><?= __('my_requests') ?></h1>
                <p class="page-subtitle"><?= __('track_status_requests') ?></p>
            </div>
            <div class="user-actions d-flex align-items-center" id="profileInfo" style="cursor: pointer;">
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
                        <h4></h4>
                        <p class="text-muted mb-0"></p>
                    </div>
                    <div class="d-flex gap-2">
                        <select class="form-select" id="statusFilter" style="width: auto;">
                            <option value="all"><?= __('all_requests') ?></option>
                            <option value="pending"><?= __('pending') ?></option>
                            <option value="approved"><?= __('approved') ?></option>
                            <option value="denied"><?= __('denied') ?></option>
                        </select>
                        <a href="<?= url('/new-request') ?>" class="btn btn-success">
                            <i class="bi bi-plus-circle me-2"></i><?= __('new_request') ?>
                        </a>
                    </div>
                </div>
                
                <div class="requests-grid" id="requestsGrid">
                    <?php if (empty($requests)): ?>
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="bi bi-calendar-x"></i>
                            </div>
                            <h5><?= __('no_requests_found_message') ?></h5>
                            <p><?= __('contact_instructor') ?></p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($requests as $request): 
                            // Calculate total days based on 7.5h Mon-Thu, 6.5h Fri
                            $start = new DateTime($request['rawStartDate']);
                            $end = new DateTime($request['rawEndDate']);
                            $totalHours = $request['totalHours'];
                            $workDays = 0;
                            $remainingHours = $totalHours;
                            $period = new DatePeriod($start, new DateInterval('P1D'), $end->modify('+1 day'));
                            foreach ($period as $dt) {
                                if (in_array($dt->format('N'), [1,2,3,4,5])) { // Mon-Fri
                                    if ($dt->format('N') == 5) { // Friday
                                        $dayHours = min(6.5, $remainingHours);
                                    } else {
                                        $dayHours = min(7.5, $remainingHours);
                                    }
                                    $workDays += $dayHours / ($dt->format('N') == 5 ? 6.5 : 7.5);
                                    $remainingHours -= $dayHours;
                                    if ($remainingHours <= 0) break;
                                }
                            }
                            $hours = $totalHours;
                            $days = $workDays;
                        ?>
                            <div class="request-card" data-status="<?= $request['status'] ?>">
                                <div class="request-header">
                                    <div class="request-duration">
                                        <strong><?= $hours ?></strong>ff (<?= number_format($days, 1) ?> day<?= $days != 1 ? 's' : '' ?>)
                                    </div>
                                    <div class="status-badge status-<?= $request['status'] ?>"><?= ucfirst($request['status']) ?></div>
                                </div>
                                <div class="request-summary">
                                    <?php 
                                    $requestDays = $request['days'] ?? 0;
                                    $ffCost = $request['ffCost'] ?? 0;
                                    $timePeriod = $request['timePeriod'] ?? 'N/A';
                                    ?>
                                    <p><strong><?= __('ff') ?> (<?= htmlspecialchars($requestDays) ?> <?= __('days') ?>)</strong></p>
                                    <p><?= __('cost') ?>: <?= htmlspecialchars($ffCost) ?> <?= __('hours') ?></p>
                                    <p><?= __('time_period') ?>: <?= htmlspecialchars($timePeriod) ?></p>
                                </div>
                                <div class="request-details">
                                    <div class="request-info">
                                        <p><strong><?= __('start') ?>:</strong> <?= htmlspecialchars($request['startDate'] ?? 'N/A') ?></p>
                                        <p><strong><?= __('end') ?>:</strong> <?= htmlspecialchars($request['endDate'] ?? 'N/A') ?></p>
                                        <p><strong><?= __('submitted') ?>:</strong> <?= htmlspecialchars($request['requestSubmitted'] ?? 'N/A') ?></p>
                                        <p><strong><?= __('request_id') ?>:</strong> #<?= str_pad($request['requestId'] ?? 0, 6, '0', STR_PAD_LEFT) ?></p>
                                    </div>
                                    <div class="request-reason">
                                        <p><strong><?= __('reason') ?>:</strong></p>
                                        <p><?= htmlspecialchars($request['reason'] ?? __('no_reason_provided')) ?></p>
                                    </div>
                                </div>
                                <?php if ($request['status'] === 'denied'): ?>
                                    <div class="alert alert-danger mt-2">
                                        <strong><?= __('denied') ?>:</strong> <?= __('request_was_not_approved') ?>
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
    <script src="<?= asset('public/js/components/NotificationManager.js') ?>"></script>
</body>
</html>
