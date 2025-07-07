<?php
// Load helper functions
require_once dirname(__DIR__, 2) . '/Helpers/UrlHelper.php';
require_once dirname(__DIR__, 2) . '/Helpers/LanguageHelper.php';
?>
<!DOCTYPE html>
<html lang="da">
<head>
    <?php require_once dirname(__DIR__) . '/components/header.php'; ?>
    <meta name="description" content="<?= __('submit_new_request') ?>" />
    <title><?= __('new_request') ?> - FerieSystem</title>
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= asset('public/css/standard/styles.css') ?>">
    <link rel="stylesheet" href="<?= asset('public/css/standard/student-styles.css') ?>">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="<?= asset('public/js/components/NotificationManager.js') ?>" defer></script>
    <script src="<?= asset('public/js/translations.js') ?>" defer></script>
    <script src="<?= asset('public/js/standard/new-request.js') ?>" defer></script>
    <script src="<?= asset('public/js/components/profileInfoPopup.js') ?>" defer></script>
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
                <div class="user-role"><?= __('student') ?></div>
                <div class="user-name" id="studentName"><?= getCurrentUserName() ?></div>
            </div>
            <ul class="nav-menu">
                <li class="nav-section">
                    <a href="<?= url('/dashboard') ?>" class="section-header">
                        <i class="bi bi-house-door text-primary"></i>
                        <span><?= __('dashboard') ?></span>
                    </a>
                </li>
                <li class="nav-section active">
                    <a href="<?= url('/new-request') ?>" class="section-header">
                        <i class="bi bi-plus-circle text-success"></i>
                        <span><?= __('new_request') ?></span>
                    </a>
                </li>
                <li class="nav-section">
                    <a href="<?= url('/requests') ?>" class="section-header">
                        <i class="bi bi-clock-history text-warning"></i>
                        <span><?= __('my_requests') ?></span>
                        <?php if (isset($notifications['pendingRequests']) && $notifications['pendingRequests'] > 0): ?>
                        <span class="notification-badge" id="requestsBadge"><?= $notifications['pendingRequests'] ?></span>
                        <?php endif; ?>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Top Header -->
        <div class="top-header">
            <div class="header-left">
                <h1 class="page-title" id="pageTitle"><?= __('new_request') ?></h1>
                <p class="page-subtitle" id="pageSubtitle"><?= __('submit_new_request') ?></p>
            </div>
            <div class="user-actions d-flex align-items-center" id="profileInfo" style="cursor: pointer;">
                <div class="d-flex align-items-center">
                    <span class="me-2" id="headerUserName"><?= strtoupper(getCurrentUserName()) ?></span>
                    <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="bi bi-person text-white"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- New Request View -->
            <div id="newRequestSection">
                <div class="row">
                    <div class="col-lg-8">
                        <form id="newRequestForm">
                            <!-- Enhanced Date & Time Selection -->
                            <div class="date-time-section">
                                <div class="section-title">
                                    <i class="bi bi-calendar-week"></i>
                                    <?= __('select_vacation_period') ?>
                                </div>
                                        
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="date-input-group">
                                                    <label for="startDate" class="form-label">
                                                        <i class="bi bi-calendar-event"></i><?= __('start_date_time') ?>
                                                    </label>
                                                    <input type="date" class="form-control date-input" id="startDate" required>
                                                    <div class="invalid-feedback" id="startDateFeedback">
                                                        <?= __('select_valid_start_date') ?>
                                                    </div>
                                                    <div class="time-selection">
                                                        <div class="time-input-wrapper">
                                                            <select class="form-select" id="startHour" required>
                                                                <option value="">Hour</option>
                                                                <option value="08">08</option>
                                                                <option value="09" selected>09</option>
                                                                <option value="10">10</option>
                                                                <option value="11">11</option>
                                                                <option value="12">12</option>
                                                                <option value="13">13</option>
                                                                <option value="14">14</option>
                                                                <option value="15">15</option>
                                                                <option value="16">16</option>
                                                                <option value="17">17</option>
                                                            </select>
                                                            <span class="time-separator">:</span>
                                                            <select class="form-select" id="startMinute" required>
                                                                <option value="00" selected>00</option>
                                                                <option value="15">15</option>
                                                                <option value="30">30</option>
                                                                <option value="45">45</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="col-md-6">
                                                <div class="date-input-group">
                                                    <label for="endDate" class="form-label">
                                                        <i class="bi bi-calendar-check"></i>End Date & Time
                                                    </label>
                                                    <input type="date" class="form-control date-input" id="endDate" required>
                                                    <div class="time-selection">
                                                        <div class="time-input-wrapper">
                                                            <select class="form-select" id="endHour" required>
                                                                <option value="">Hour</option>
                                                                <option value="08">08</option>
                                                                <option value="09">09</option>
                                                                <option value="10">10</option>
                                                                <option value="11">11</option>
                                                                <option value="12">12</option>
                                                                <option value="13">13</option>
                                                                <option value="14">14</option>
                                                                <option value="15">15</option>
                                                                <option value="16">16</option>
                                                                <option value="17" selected>17</option>
                                                            </select>
                                                            <span class="time-separator">:</span>
                                                            <select class="form-select" id="endMinute" required>
                                                                <option value="00" selected>00</option>
                                                                <option value="15">15</option>
                                                                <option value="30">30</option>
                                                                <option value="45">45</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                    </div>

                    <!-- Request Summary Section -->
                    <div class="request-summary-section mt-4 mb-4" id="requestSummarySection">
                        <div class="summary-header">
                            <h5><i class="bi bi-calculator me-2"></i>Request Summary</h5>
                        </div>
                        <div class="summary-content">
                            <div class="summary-item">
                                <div class="summary-label">Duration</div>
                                <div class="summary-value" id="requestDuration">Please select dates</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Working Hours</div>
                                <div class="summary-value" id="workingDays">0ff</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label"><?= __('vacation_balance') ?></div>
                                <div class="summary-value" id="currentBalance"><?= __('loading') ?></div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label"><?= __('balance_after_request') ?></div>
                                <div class="summary-value" id="balanceAfterRequest"><?= __('loading') ?></div>
                            </div>
                            
                            <!-- Warnings -->
                            <div class="alert alert-warning mt-3" id="balanceWarning" style="display: none;">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                <strong><?= __('low_balance_warning') ?>:</strong> <?= __('low_balance_notice') ?>
                            </div>
                            <div class="alert alert-danger mt-3" id="balanceError" style="display: none;">
                                <i class="bi bi-x-circle me-2"></i>
                                <strong><?= __('insufficient_balance_notice') ?>:</strong> <?= __('insufficient_balance_notice') ?>
                            </div>
                        </div>
                    </div>

                    <!-- Reason -->
                                    <div class="mb-4">
                                        <label for="requestReason" class="form-label">
                                            <i class="bi bi-chat-text me-1"></i><?= __('reason_for_request') ?>
                                        </label>
                                        <textarea class="form-control" id="requestReason" rows="4" 
                                                placeholder="<?= __('request_reason_placeholder') ?>"></textarea>
                                        <div class="form-text">
                                            <small class="text-muted"><?= __('be_specific_help') ?></small>
                                        </div>
                                    </div>
                                    
                                    <!-- Form Actions -->
                                    <div class="btn-group-custom">
                                        <button type="submit" class="btn btn-success">
                                            <i class="bi bi-send me-2"></i><?= __('submit_request') ?>
                                        </button>
                                        <button type="button" class="btn btn-secondary" onclick="resetForm()">
                                            <i class="bi bi-arrow-clockwise me-2"></i><?= __('cancel') ?>
                                        </button>
                                        <button type="button" class="btn btn-outline-primary" onclick="previewRequest()">
                                            <i class="bi bi-eye me-2"></i><?= __('view') ?>
                                        </button>
                                    </div>
                                </form>
                    </div>
                    
                    <!-- Request Summary Sidebar -->
                    <div class="col-lg-4">
                        <!-- Quick Tips -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="bi bi-lightbulb me-2"></i><?= __('important_notes') ?></h6>
                            </div>
                            <div class="card-body">
                                <ul class="tips-list">
                                    <li><?= __('submit_48_hours_advance') ?></li>
                                    <li><?= __('emergency_requests_contact') ?></li>
                                    <li><?= __('approved_requests_cannot_modify') ?></li>
                                    <li><?= __('check_balance_before_submit') ?></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
