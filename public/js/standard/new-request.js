// New Request page specific functionality
document.addEventListener("DOMContentLoaded", function() {
    
    // Form elements
    const newRequestForm = document.getElementById('newRequestForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const requestReasonInput = document.getElementById('requestReason');

    // Initialize new request page
    init();

    function init() {
        updateBalanceDisplay();
        setupEventListeners();
        setMinimumStartDateTime();
    }

    function updateBalanceDisplay() {
        // Get accurate vacation hour calculations
        const vacationHours = StudentUtils.calculateVacationHours();
        
        // Helper function to safely update element
        function safeUpdate(id, value) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }

        safeUpdate('currentBalance', `${vacationHours.remainingHours}ff (${(vacationHours.remainingHours / 8).toFixed(1)} days)`);
        safeUpdate('balanceAfterRequest', `${vacationHours.remainingHours}ff`);
    }

    function setMinimumStartDateTime() {
        const now = new Date();
        const minimumDateTime = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // Add 48 hours
        
        // Adjust to next working hours if needed
        const adjustedDateTime = adjustToWorkingHours(minimumDateTime);
        
        // Use the already declared variables instead of redeclaring
        const startHourSelect = document.getElementById('startHour');
        const startMinuteSelect = document.getElementById('startMinute');
        
        // Set the date input
        if (startDateInput) {
            startDateInput.value = adjustedDateTime.toISOString().split('T')[0];
        }
        
        // Set the hour
        if (startHourSelect) {
            const hour = adjustedDateTime.getHours().toString().padStart(2, '0');
            // Ensure the hour option exists in the select before setting it
            const hourOption = startHourSelect.querySelector(`option[value="${hour}"]`);
            if (hourOption) {
                startHourSelect.value = hour;
            } else {
                // Default to 09:00 if calculated hour doesn't exist in options
                startHourSelect.value = '09';
            }
        }
        
        // Set the minute
        if (startMinuteSelect) {
            const roundedMinute = Math.round(adjustedDateTime.getMinutes() / 15) * 15;
            // Handle minute overflow (e.g., 60 minutes should become 0 of next hour)
            const finalMinute = roundedMinute >= 60 ? 0 : roundedMinute;
            const minuteValue = finalMinute.toString().padStart(2, '0');
            
            const minuteOption = startMinuteSelect.querySelector(`option[value="${minuteValue}"]`);
            if (minuteOption) {
                startMinuteSelect.value = minuteValue;
            } else {
                startMinuteSelect.value = '00';
            }
        }
    }
    
    function adjustToWorkingHours(dateTime) {
        const workingStartHour = 8; // 8 AM
        const workingEndHour = 17; // 5 PM
        const result = new Date(dateTime);
        
        const dayOfWeek = result.getDay();
        const hour = result.getHours();
        
        // If it's weekend (Saturday = 6, Sunday = 0), move to next Monday
        if (dayOfWeek === 0) { // Sunday
            result.setDate(result.getDate() + 1); // Move to Monday
            result.setHours(workingStartHour, 0, 0, 0);
        } else if (dayOfWeek === 6) { // Saturday
            result.setDate(result.getDate() + 2); // Move to Monday
            result.setHours(workingStartHour, 0, 0, 0);
        } else {
            // It's a weekday, check if time is within working hours
            if (hour < workingStartHour) {
                result.setHours(workingStartHour, 0, 0, 0);
            } else if (hour >= workingEndHour) {
                result.setDate(result.getDate() + 1);
                result.setHours(workingStartHour, 0, 0, 0);
                
                const nextDayOfWeek = result.getDay();
                if (nextDayOfWeek === 0) { // Sunday
                    result.setDate(result.getDate() + 1); // Move to Monday
                } else if (nextDayOfWeek === 6) { // Saturday
                    result.setDate(result.getDate() + 2); // Move to Monday
                }
            }
        }
        
        return result;
    }

    function setupEventListeners() {
        // Helper function to safely add event listeners
        function safeAddListener(id, event, handler) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            }
        }

        // Form submission
        if (newRequestForm) {
            newRequestForm.addEventListener('submit', handleRequestSubmission);
        }
        
        // Date change listeners for duration calculation
        if (startDateInput) {
            startDateInput.addEventListener('change', calculateRequestDuration);
        }
        if (endDateInput) {
            endDateInput.addEventListener('change', calculateRequestDuration);
        }
        
        // Time change listeners
        safeAddListener('startHour', 'change', calculateRequestDuration);
        safeAddListener('startMinute', 'change', calculateRequestDuration);
        safeAddListener('endHour', 'change', calculateRequestDuration);
        safeAddListener('endMinute', 'change', calculateRequestDuration);
        
        // Real-time form validation
        safeAddListener('requestReason', 'input', validateForm);
        if (startDateInput) {
            startDateInput.addEventListener('change', validateForm);
        }
        safeAddListener('startHour', 'change', validateForm);
        safeAddListener('startMinute', 'change', validateForm);
        if (endDateInput) {
            endDateInput.addEventListener('change', validateForm);
        }
        
        // Update form when dates change to check 48-hour advance notice
        if (startDateInput) {
            startDateInput.addEventListener('change', checkAdvanceNotice);
        }
        safeAddListener('startHour', 'change', checkAdvanceNotice);
        safeAddListener('startMinute', 'change', checkAdvanceNotice);
    }

    function calculateRequestDuration() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        
        // Reset displays
        const vacationHours = StudentUtils.calculateVacationHours();
        document.getElementById('requestDuration').textContent = 'Please select dates';
        document.getElementById('workingDays').textContent = '0ff';
        document.getElementById('balanceAfterRequest').textContent = vacationHours.remainingHours + 'ff';
        
        // Hide warnings
        document.getElementById('balanceWarning').style.display = 'none';
        document.getElementById('balanceError').style.display = 'none';
        
        if (!startDate || !endDate) {
            return;
        }
        
        // Create full datetime objects
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (startHour && startMinute) {
            start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        }
        
        if (endHour && endMinute) {
            end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
        }
        
        if (end <= start) {
            document.getElementById('requestDuration').textContent = 'End must be after start';
            document.getElementById('requestDuration').style.color = '#dc3545';
            return;
        }
        
        // Calculate working hours and weekend hours
        const result = StudentUtils.calculateWorkingHours(start, end);
        const totalHours = result.workingHours;
        const totalCalendarDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        // Update display
        document.getElementById('requestDuration').textContent = `${totalCalendarDays} calendar day${totalCalendarDays !== 1 ? 's' : ''}`;
        document.getElementById('requestDuration').style.color = '#ffffff';
        document.getElementById('workingDays').textContent = `${totalHours}ff (${(totalHours / 8).toFixed(1)} days)`;
        
        // Calculate balance after request
        const balanceAfter = vacationHours.remainingHours - totalHours;
        const balanceElement = document.getElementById('balanceAfterRequest');
        balanceElement.textContent = `${balanceAfter}ff (${(balanceAfter / 8).toFixed(1)} days)`;
        
        // Update balance display colors and warnings
        if (balanceAfter < 0) {
            balanceElement.className = 'summary-value insufficient';
            document.getElementById('balanceError').style.display = 'block';
        } else if (balanceAfter <= 24) { // Less than 3 days (24 hours)
            balanceElement.className = 'summary-value warning';
            document.getElementById('balanceWarning').style.display = 'block';
        } else {
            balanceElement.className = 'summary-value good';
        }
        
        // Update preview
        updateRequestPreview();
        
        // Check advance notice
        checkAdvanceNotice();
    }
    
    function checkAdvanceNotice() {
        const startDate = startDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        
        // Remove existing advance notice warning
        const existingWarning = document.getElementById('advanceNoticeWarning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        if (!startDate || !startHour || !startMinute) {
            return;
        }
        
        const requestStart = new Date(`${startDate}T${startHour}:${startMinute}:00`);
        const now = new Date();
        const hoursDifference = (requestStart - now) / (1000 * 60 * 60);
        
        if (hoursDifference < 48) {
            // Create advance notice warning
            const warningHtml = `
                <div id="advanceNoticeWarning" class="alert alert-warning mt-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Short Notice:</strong> This request is less than 48 hours in advance. 
                    You can still submit it, but approval may be denied.
                    <small class="d-block mt-1">Time until request: ${Math.round(hoursDifference)} hours</small>
                </div>
            `;
            
            // Insert after the request summary card
            const summaryCard = document.querySelector('.col-lg-4 .card');
            if (summaryCard) {
                summaryCard.insertAdjacentHTML('afterend', warningHtml);
            } else {
                // Fallback: insert after the form container
                const formContainer = document.querySelector('#newRequestSection .col-lg-8');
                if (formContainer) {
                    formContainer.insertAdjacentHTML('afterend', warningHtml);
                }
            }
        }
    }
    
    function updateRequestPreview() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        
        const previewDiv = document.getElementById('requestPreview');
        
        // Only proceed if the preview elements exist
        if (!previewDiv) {
            return;
        }
        
        if (startDate && endDate && startHour && startMinute && endHour && endMinute) {
            const startDateTime = `${StudentUtils.formatDate(startDate)} at ${startHour}:${startMinute}`;
            const endDateTime = `${StudentUtils.formatDate(endDate)} at ${endHour}:${endMinute}`;
            
            const previewStart = document.getElementById('previewStart');
            const previewEnd = document.getElementById('previewEnd');
            const previewType = document.getElementById('previewType');
            
            if (previewStart) previewStart.textContent = startDateTime;
            if (previewEnd) previewEnd.textContent = endDateTime;
            if (previewType) previewType.textContent = 'Vacation Request';
            
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    }
    
    function validateForm() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const reason = document.getElementById('requestReason').value;
        const submitBtn = document.querySelector('button[type="submit"]');
        
        // Basic validation
        let isValid = true;
        
        if (!startDate) {
            startDateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            startDateInput.classList.remove('is-invalid');
            startDateInput.classList.add('is-valid');
        }
        
        if (!endDate) {
            endDateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            endDateInput.classList.remove('is-invalid');
            endDateInput.classList.add('is-valid');
        }
        
        // Reason is optional, just mark as valid if provided
        document.getElementById('requestReason').classList.remove('is-invalid');
        if (reason && reason.trim().length > 0) {
            document.getElementById('requestReason').classList.add('is-valid');
        } else {
            document.getElementById('requestReason').classList.remove('is-valid');
        }
        
        // Enable/disable submit button
        submitBtn.disabled = !isValid;
        
        return isValid;
    }    async function handleRequestSubmission(e) {
        e.preventDefault();
        
        // Validate form first
        if (!validateForm()) {
            StudentUtils.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        const reason = document.getElementById('requestReason').value;
        
        // Create full datetime strings
        const startDateTime = `${startDate}T${startHour}:${startMinute}:00`;
        const endDateTime = `${endDate}T${endHour}:${endMinute}:00`;
        
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        
        if (end <= start) {
            StudentUtils.showNotification('End date must be after start date', 'danger');
            return;
        }
        
        // Calculate working hours
        const result = StudentUtils.calculateWorkingHours(start, end);
        const workingHours = result.workingHours;
        
        const vacationHours = StudentUtils.calculateVacationHours();
        if (workingHours > vacationHours.remainingHours) {
            StudentUtils.showNotification('Request exceeds available vacation hours', 'danger');
            return;
        }
        
        // Check if it's a short notice request
        const now = new Date();
        const hoursDifference = (start - now) / (1000 * 60 * 60);
        const isShortNotice = hoursDifference < 48;
        
        let confirmMessage = `Submit vacation request for ${workingHours}ff (${(workingHours / 8).toFixed(1)} days)?`;
        if (isShortNotice) {
            confirmMessage += '\n\nNote: This is a short notice request (less than 48 hours in advance).';
        }
        
        // Show confirmation dialog
        if (!confirm(confirmMessage)) {
            return;
        }

        // Disable submit button to prevent double submission
        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        try {
            // Create new request
            const newRequest = {
                id: 'REQ' + String(requestsData.length + 1).padStart(3, '0'),
                startDate: startDateTime,
                endDate: endDateTime,
                reason: reason,
                status: 'pending',
                submitDate: new Date().toISOString(),
                hours: workingHours,
                isShortNotice: isShortNotice,
                totalCalendarDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
            };
            
            // Use DataManager to add request and update data
            const apiResult = await DataManager.addRequest(newRequest);
            
            // Reset form
            resetForm();
            
            let successMessage = 'Request submitted successfully!';
            if (isShortNotice) {
                successMessage += ' (Short notice - may take longer to approve)';
            }
            StudentUtils.showNotification(successMessage, 'success');
            
            // Redirect to requests page after a short delay
            // setTimeout(() => {
            //     window.location.href = 'index.php?route=/requests';
            // }, 2000);
            
        } catch (error) {
            console.error('Error submitting request:', error);
            StudentUtils.showNotification('Failed to submit request: ' + error.message, 'danger');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    function resetForm() {
        newRequestForm.reset();
        
        // Set minimum start date/time instead of clearing
        setMinimumStartDateTime();
        
        // Reset end date and reason
        document.getElementById('endDate').value = '';
        document.getElementById('endHour').value = '17';
        document.getElementById('endMinute').value = '00';
        document.getElementById('requestReason').value = '';
        
        // Reset validation classes
        document.querySelectorAll('.form-control').forEach(control => {
            control.classList.remove('is-valid', 'is-invalid');
        });
        
        // Reset summary displays
        const vacationHours = StudentUtils.calculateVacationHours();
        document.getElementById('requestDuration').textContent = 'Please select dates';
        document.getElementById('workingDays').textContent = '0ff';
        document.getElementById('balanceAfterRequest').textContent = vacationHours.remainingHours + 'ff';
        document.getElementById('balanceAfterRequest').className = 'summary-value';
        
        // Hide preview and warnings
        const requestPreview = document.getElementById('requestPreview');
        if (requestPreview) {
            requestPreview.style.display = 'none';
        }
        document.getElementById('balanceWarning').style.display = 'none';
        document.getElementById('balanceError').style.display = 'none';
        
        // Remove advance notice warning
        const advanceWarning = document.getElementById('advanceNoticeWarning');
        if (advanceWarning) {
            advanceWarning.remove();
        }
        
        // Enable submit button
        document.querySelector('button[type="submit"]').disabled = false;
    }
    
    function previewRequest() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        const reason = document.getElementById('requestReason').value;
        
        if (!startDate || !endDate || !startHour || !startMinute || !endHour || !endMinute || !reason) {
            StudentUtils.showNotification('Please fill in all fields to preview the request', 'warning');
            return;
        }
        
        const start = new Date(`${startDate}T${startHour}:${startMinute}:00`);
        const end = new Date(`${endDate}T${endHour}:${endMinute}:00`);
        
        if (end <= start) {
            StudentUtils.showNotification('End date must be after start date', 'danger');
            return;
        }
        
        const result = StudentUtils.calculateWorkingHours(start, end);
        const workingHours = result.workingHours;
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const vacationHours = StudentUtils.calculateVacationHours();
        
        // Check advance notice
        const now = new Date();
        const hoursDifference = (start - now) / (1000 * 60 * 60);
        const isShortNotice = hoursDifference < 48;
        
        const previewHtml = `
            <div class="modal fade" id="requestPreviewModal" tabindex="-1" aria-labelledby="requestPreviewModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-dark">
                        <div class="modal-header">
                            <h5 class="modal-title text-white" id="requestPreviewModalLabel">Request Preview</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${isShortNotice ? `
                                <div class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Short Notice:</strong> This request is less than 48 hours in advance.
                                </div>
                            ` : ''}
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">Request Details</h6>
                                    <div class="preview-detail">
                                        <strong>Type:</strong> Vacation Request
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Start:</strong> ${StudentUtils.formatDate(startDate)} at ${startHour}:${startMinute}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>End:</strong> ${StudentUtils.formatDate(endDate)} at ${endHour}:${endMinute}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Reason:</strong> ${reason}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary">Duration Breakdown</h6>
                                    <div class="preview-detail">
                                        <strong>Total Calendar Days:</strong> ${totalDays}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Working Hours:</strong> ${workingHours}ff (${(workingHours / 8).toFixed(1)} days)
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Balance After:</strong> ${vacationHours.remainingHours - workingHours}ff (${((vacationHours.remainingHours - workingHours) / 8).toFixed(1)} days)
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success" onclick="document.getElementById('newRequestForm').dispatchEvent(new Event('submit', {cancelable: true}));" data-bs-dismiss="modal">Submit Request</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('requestPreviewModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', previewHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('requestPreviewModal'));
        modal.show();
        
        // Clean up modal after hiding
        document.getElementById('requestPreviewModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Make functions globally available
    window.resetForm = resetForm;
    window.previewRequest = previewRequest;
});
