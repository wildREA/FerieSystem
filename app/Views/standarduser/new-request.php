<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Submit new vacation request" />
    <title>New Request - FerieSystem</title>
    <!-- Frameworks & Tools -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="css/standard/styles.css">
    <link rel="stylesheet" href="css/standard/student-styles.css">
    <!-- Scripts (deferred) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="js/standard/common.js" defer></script>
    <script src="js/standard/new-request.js" defer></script>
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
                <li class="nav-section active">
                    <a href="new-request.html" class="section-header">
                        <i class="bi bi-plus-circle text-success"></i>
                        <span>New Request</span>
                    </a>
                </li>
                <li class="nav-section">
                    <a href="requests.html" class="section-header">
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
                <h1 class="page-title" id="pageTitle">New Request</h1>
                <p class="page-subtitle" id="pageSubtitle">Submit a new vacation request</p>
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
            <!-- New Request View -->
            <div id="newRequestSection">
                <div class="row">
                    <div class="col-lg-8">
                        <form id="newRequestForm">
                            <!-- Enhanced Date & Time Selection -->
                            <div class="date-time-section">
                                <div class="section-title">
                                    <i class="bi bi-calendar-week"></i>
                                    Select Vacation Period
                                </div>
                                        
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="date-input-group">
                                                    <label for="startDate" class="form-label">
                                                        <i class="bi bi-calendar-event"></i>Start Date & Time
                                                    </label>
                                                    <input type="date" class="form-control date-input" id="startDate" required>
                                                    <div class="invalid-feedback" id="startDateFeedback">
                                                        Please select a valid start date.
                                                    </div>
                                                    <div class="time-selection">
                                                        <div class="time-input-wrapper">
                                                            <select class="form-select" id="startHour" required>
                                                                <option value="">Hour</option>
                                                                <option value="08">08:00</option>
                                                                <option value="09" selected>09:00</option>
                                                                <option value="10">10:00</option>
                                                                <option value="11">11:00</option>
                                                                <option value="12">12:00</option>
                                                                <option value="13">13:00</option>
                                                                <option value="14">14:00</option>
                                                                <option value="15">15:00</option>
                                                                <option value="16">16:00</option>
                                                                <option value="17">17:00</option>
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
                                                                <option value="08">08:00</option>
                                                                <option value="09">09:00</option>
                                                                <option value="10">10:00</option>
                                                                <option value="11">11:00</option>
                                                                <option value="12">12:00</option>
                                                                <option value="13">13:00</option>
                                                                <option value="14">14:00</option>
                                                                <option value="15">15:00</option>
                                                                <option value="16">16:00</option>
                                                                <option value="17" selected>17:00</option>
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
                                <div class="summary-label">Current Balance</div>
                                <div class="summary-value" id="currentBalance">Loading...</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Balance After Request</div>
                                <div class="summary-value" id="balanceAfterRequest">Loading...</div>
                            </div>
                            
                            <!-- Warnings -->
                            <div class="alert alert-warning mt-3" id="balanceWarning" style="display: none;">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                <strong>Low Balance:</strong> This request will leave you with less than 3 days of vacation time.
                            </div>
                            <div class="alert alert-danger mt-3" id="balanceError" style="display: none;">
                                <i class="bi bi-x-circle me-2"></i>
                                <strong>Insufficient Balance:</strong> This request exceeds your available vacation hours.
                            </div>
                        </div>
                    </div>

                    <!-- Reason -->
                                    <div class="mb-4">
                                        <label for="requestReason" class="form-label">
                                            <i class="bi bi-chat-text me-1"></i>Reason for Request
                                        </label>
                                        <textarea class="form-control" id="requestReason" rows="4" 
                                                placeholder="Optional message"></textarea>
                                        <div class="form-text">
                                            <small class="text-muted">Be specific about your request to help ensure quick approval.</small>
                                        </div>
                                    </div>
                                    
                                    <!-- Form Actions -->
                                    <div class="btn-group-custom">
                                        <button type="submit" class="btn btn-success">
                                            <i class="bi bi-send me-2"></i>Submit Request
                                        </button>
                                        <button type="button" class="btn btn-secondary" onclick="resetForm()">
                                            <i class="bi bi-arrow-clockwise me-2"></i>Reset
                                        </button>
                                        <button type="button" class="btn btn-outline-primary" onclick="previewRequest()">
                                            <i class="bi bi-eye me-2"></i>Preview
                                        </button>
                                    </div>
                                </form>
                    </div>
                    
                    <!-- Request Summary Sidebar -->
                    <div class="col-lg-4">
                        <!-- Quick Tips -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="bi bi-lightbulb me-2"></i>Quick Tips</h6>
                            </div>
                            <div class="card-body">
                                <ul class="tips-list">
                                    <li>Submit requests at least 48 hours in advance</li>
                                    <li>Weekend hours don't count toward your balance</li>
                                    <li>Approved requests cannot be modified</li>
                                    <li>Check your balance before submitting</li>
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
