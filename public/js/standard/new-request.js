const studentData = {
    id: "STU001",
    name: "Emma Nielsen",
    email: "emma.nielsen@student.dk",
    course: "Computer Science",
    year: 3,
    totalVacationHours: 200
};

const DataManager = {
    init() {
    },

    async addRequest(newRequest) {
        console.log('Adding new request:', newRequest);
        try {
            const requestData = {
                requestType: 'vacation',
                startDateTime: newRequest.startDate,
                endDateTime: newRequest.endDate,
                reason: newRequest.reason
            };
            
            console.log('Request data to submit:', requestData);

            const response = await fetch('/api/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', responseText);
                throw new Error('Server returned invalid JSON response: ' + responseText.substring(0, 100));
            }
            
            console.log('Request submitted successfully:', result);
            return result;
        } catch (error) {
            console.error('Error submitting request:', error);
            throw error;
        }
    }
};

const StudentUtils = {
    calculateVacationHours() {
        // This would need to be fetched from server in a real implementation
        const usedHours = 0; // Placeholder
        const pendingHours = 0; // Placeholder
        const remainingHours = studentData.totalVacationHours - usedHours;
        
        return {
            totalHours: studentData.totalVacationHours,
            usedHours: usedHours,
            pendingHours: pendingHours,
            remainingHours: remainingHours
        };
    },

    calculateWorkingHours(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const workingStartHour = 8;
        const workingEndHour = 17;
        const maxDailyHours = workingEndHour - workingStartHour;
        
        let totalWorkingHours = 0;
        const current = new Date(start);
        
        while (current < end) {
            const dayOfWeek = current.getDay();
            
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                let dayStart, dayEnd;
                
                if (current.toDateString() === start.toDateString()) {
                    const startHour = Math.max(start.getHours(), workingStartHour);
                    const startMinute = start.getHours() >= workingStartHour ? start.getMinutes() : 0;
                    dayStart = startHour + (startMinute / 60);
                } else {
                    dayStart = workingStartHour;
                }
                
                if (current.toDateString() === end.toDateString()) {
                    const endHour = Math.min(end.getHours(), workingEndHour);
                    const endMinute = end.getHours() <= workingEndHour ? end.getMinutes() : 0;
                    dayEnd = endHour + (endMinute / 60);
                } else {
                    dayEnd = workingEndHour;
                }
                
                const dailyHours = Math.max(0, dayEnd - dayStart);
                totalWorkingHours += dailyHours;
            }
            
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0);
        }
        
        totalWorkingHours = Math.round(totalWorkingHours * 10) / 10;
        
        return { 
            workingHours: Math.max(0.1, totalWorkingHours)
        };
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    },

    updateRequestsBadge() {
        // Update notification badge in navigation
        // This would typically fetch the current pending request count from the server
        const badgeElement = document.querySelector('.notification-badge');
        if (badgeElement) {
            // For now, just hide it since we removed notification symbols
            badgeElement.style.display = 'none';
        }
    },

    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};

document.addEventListener("DOMContentLoaded", function() {
    
    const newRequestForm = document.getElementById('newRequestForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const requestReasonInput = document.getElementById('requestReason');

    function init() {
        DataManager.init();
        updateBalanceDisplay();
        setupEventListeners();
        setMinimumStartDateTime(); // This will call updateEndTimeFromStart() at the end
        StudentUtils.updateRequestsBadge();
    }

    function updateBalanceDisplay() {
        const vacationHours = StudentUtils.calculateVacationHours();
        
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
        const minimumDateTime = new Date(now.getTime() + (48 * 60 * 60 * 1000));
        
        const adjustedDateTime = adjustToWorkingHours(minimumDateTime);
        
        const startHourSelect = document.getElementById('startHour');
        const startMinuteSelect = document.getElementById('startMinute');
        
        if (startDateInput) {
            startDateInput.value = adjustedDateTime.toISOString().split('T')[0];
        }
        
        if (startHourSelect) {
            const hour = adjustedDateTime.getHours().toString().padStart(2, '0');
            const hourOption = startHourSelect.querySelector(`option[value="${hour}"]`);
            if (hourOption) {
                startHourSelect.value = hour;
            } else {
                startHourSelect.value = '09';
            }
        }
        
        if (startMinuteSelect) {
            const roundedMinute = Math.round(adjustedDateTime.getMinutes() / 15) * 15;
            const finalMinute = roundedMinute >= 60 ? 0 : roundedMinute;
            const minuteValue = finalMinute.toString().padStart(2, '0');
            
            const minuteOption = startMinuteSelect.querySelector(`option[value="${minuteValue}"]`);
            if (minuteOption) {
                startMinuteSelect.value = minuteValue;
            } else {
                startMinuteSelect.value = '00';
            }
        }
        
        // Auto-set end date/time after start date/time is set
        setTimeout(() => {
            updateEndTimeFromStart();
        }, 50);
    }
    
    function adjustToWorkingHours(dateTime) {
        const workingStartHour = 8;
        const workingEndHour = 17;
        const result = new Date(dateTime);
        
        const dayOfWeek = result.getDay();
        const hour = result.getHours();
        
        if (dayOfWeek === 0) {
            result.setDate(result.getDate() + 1);
            result.setHours(workingStartHour, 0, 0, 0);
        } else if (dayOfWeek === 6) {
            result.setDate(result.getDate() + 2);
            result.setHours(workingStartHour, 0, 0, 0);
        } else {
            if (hour < workingStartHour) {
                result.setHours(workingStartHour, 0, 0, 0);
            } else if (hour >= workingEndHour) {
                result.setDate(result.getDate() + 1);
                result.setHours(workingStartHour, 0, 0, 0);
                
                const nextDayOfWeek = result.getDay();
                if (nextDayOfWeek === 0) {
                    result.setDate(result.getDate() + 1);
                } else if (nextDayOfWeek === 6) {
                    result.setDate(result.getDate() + 2);
                }
            }
        }
        
        return result;
    }

    function updateEndTimeFromStart() {
        const startDate = startDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHourSelect = document.getElementById('endHour');
        const endMinuteSelect = document.getElementById('endMinute');
        
        if (!startDate || !startHour || !startMinute || !endHourSelect || !endMinuteSelect) {
            return;
        }
        
        if (endDateInput) {
            endDateInput.value = startDate;
        }
        
        // Create a proper date object with the selected start date
        const startTime = new Date(`${startDate}T${startHour}:${startMinute}:00`);
        
        // Add 15 minutes to get the end time
        const endTime = new Date(startTime.getTime() + (15 * 60 * 1000));
        
        // Check if end time goes beyond the same day or working hours
        let endHour = endTime.getHours().toString().padStart(2, '0');
        let endMinute = endTime.getMinutes().toString().padStart(2, '0');
        
        // If the end time goes beyond the same day, adjust accordingly
        if (endTime.toDateString() !== startTime.toDateString()) {
            // If it crosses to next day, set it to end of working hours on the same day
            const adjustedEndTime = new Date(startTime);
            adjustedEndTime.setHours(17, 0, 0, 0); // 17:00
            endHour = adjustedEndTime.getHours().toString().padStart(2, '0');
            endMinute = adjustedEndTime.getMinutes().toString().padStart(2, '0');
        }
        
        const endHourOption = endHourSelect.querySelector(`option[value="${endHour}"]`);
        const endMinuteOption = endMinuteSelect.querySelector(`option[value="${endMinute}"]`);
        
        if (endHourOption) {
            endHourSelect.value = endHour;
        } else {
            const lastHourOption = endHourSelect.querySelector('option:last-child');
            if (lastHourOption) {
                endHourSelect.value = lastHourOption.value;
            }
        }
        
        if (endMinuteOption) {
            endMinuteSelect.value = endMinute;
        } else {
            const availableMinutes = Array.from(endMinuteSelect.options).map(opt => opt.value);
            const closestMinute = availableMinutes.reduce((closest, current) => {
                return Math.abs(parseInt(current) - parseInt(endMinute)) < Math.abs(parseInt(closest) - parseInt(endMinute)) ? current : closest;
            });
            endMinuteSelect.value = closestMinute;
        }
        
        calculateRequestDuration();
    }

    function setupEventListeners() {
        function safeAddListener(id, event, handler) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            }
        }

        if (newRequestForm) {
            newRequestForm.addEventListener('submit', handleRequestSubmission);
        }
        
        if (startDateInput) {
            startDateInput.addEventListener('change', calculateRequestDuration);
        }
        if (endDateInput) {
            endDateInput.addEventListener('change', calculateRequestDuration);
        }
        
        safeAddListener('startHour', 'change', calculateRequestDuration);
        safeAddListener('startMinute', 'change', calculateRequestDuration);
        safeAddListener('endHour', 'change', calculateRequestDuration);
        safeAddListener('endMinute', 'change', calculateRequestDuration);
        
        safeAddListener('startHour', 'change', updateEndTimeFromStart);
        safeAddListener('startMinute', 'change', updateEndTimeFromStart);
        if (startDateInput) {
            startDateInput.addEventListener('change', updateEndTimeFromStart);
        }
        
        safeAddListener('requestReason', 'input', validateForm);
        if (startDateInput) {
            startDateInput.addEventListener('change', validateForm);
        }
        safeAddListener('startHour', 'change', validateForm);
        safeAddListener('startMinute', 'change', validateForm);
        if (endDateInput) {
            endDateInput.addEventListener('change', validateForm);
        }
        
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
        
        const vacationHours = StudentUtils.calculateVacationHours();
        document.getElementById('requestDuration').textContent = 'Please select dates';
        document.getElementById('workingDays').textContent = '0ff';
        document.getElementById('balanceAfterRequest').textContent = vacationHours.remainingHours + 'ff';
        
        document.getElementById('balanceWarning').style.display = 'none';
        document.getElementById('balanceError').style.display = 'none';
        
        if (!startDate || !endDate) {
            return;
        }
        
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
        
        const result = StudentUtils.calculateWorkingHours(start, end);
        const totalHours = result.workingHours;
        const totalCalendarDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        document.getElementById('requestDuration').textContent = `${totalCalendarDays} calendar day${totalCalendarDays !== 1 ? 's' : ''}`;
        document.getElementById('requestDuration').style.color = '#ffffff';
        document.getElementById('workingDays').textContent = `${totalHours}ff (${(totalHours / 8).toFixed(1)} days)`;
        
        const balanceAfter = vacationHours.remainingHours - totalHours;
        const balanceElement = document.getElementById('balanceAfterRequest');
        balanceElement.textContent = `${balanceAfter}ff (${(balanceAfter / 8).toFixed(1)} days)`;
        
        if (balanceAfter < 0) {
            balanceElement.className = 'summary-value insufficient';
            document.getElementById('balanceError').style.display = 'block';
        } else if (balanceAfter <= 24) {
            balanceElement.className = 'summary-value warning';
            document.getElementById('balanceWarning').style.display = 'block';
        } else {
            balanceElement.className = 'summary-value good';
        }
        
        updateRequestPreview();
        
        checkAdvanceNotice();
    }
    
    function checkAdvanceNotice() {
        const startDate = startDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        
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
            const warningHtml = `
                <div id="advanceNoticeWarning" class="alert alert-warning mt-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Short Notice:</strong> This request is less than 48 hours in advance. 
                    You can still submit it, but approval may be denied.
                    <small class="d-block mt-1">Time until request: ${Math.round(hoursDifference)} hours</small>
                </div>
            `;
            
            const summaryCard = document.querySelector('.col-lg-4 .card');
            if (summaryCard) {
                summaryCard.insertAdjacentHTML('afterend', warningHtml);
            } else {
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
        
        document.getElementById('requestReason').classList.remove('is-invalid');
        if (reason && reason.trim().length > 0) {
            document.getElementById('requestReason').classList.add('is-valid');
        } else {
            document.getElementById('requestReason').classList.remove('is-valid');
        }
        
        submitBtn.disabled = !isValid;
        
        return isValid;
    }    async function handleRequestSubmission(e) {
        e.preventDefault();
        
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
        
        const startDateTime = `${startDate}T${startHour}:${startMinute}:00`;
        const endDateTime = `${endDate}T${endHour}:${endMinute}:00`;
        
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        
        if (end <= start) {
            StudentUtils.showNotification('End date must be after start date', 'danger');
            return;
        }
        
        const result = StudentUtils.calculateWorkingHours(start, end);
        const workingHours = result.workingHours;
        
        const vacationHours = StudentUtils.calculateVacationHours();
        if (workingHours > vacationHours.remainingHours) {
            StudentUtils.showNotification('Request exceeds available vacation hours', 'danger');
            return;
        }
        
        const now = new Date();
        const hoursDifference = (start - now) / (1000 * 60 * 60);
        const isShortNotice = hoursDifference < 48;
        
        let confirmMessage = `Submit vacation request for ${workingHours}ff (${(workingHours / 8).toFixed(1)} days)?`;
        if (isShortNotice) {
            confirmMessage += '\n\nNote: This is a short notice request (less than 48 hours in advance).';
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }

        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        try {
            const newRequest = {
                startDate: startDateTime,
                endDate: endDateTime,
                reason: reason,
                status: 'pending',
                submitDate: new Date().toISOString(),
                hours: workingHours,
                isShortNotice: isShortNotice,
                totalCalendarDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
            };
            
            const apiResult = await DataManager.addRequest(newRequest);
            
            resetForm();
            
            let successMessage = 'Request submitted successfully!';
            if (isShortNotice) {
                successMessage += ' (Short notice - may take longer to approve)';
            }
            StudentUtils.showNotification(successMessage, 'success');
            
        } catch (error) {
            console.error('Error submitting request:', error);
            StudentUtils.showNotification('Failed to submit request: ' + error.message, 'danger');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    function resetForm() {
        newRequestForm.reset();
        
        setMinimumStartDateTime();
        
        document.getElementById('endDate').value = '';
        document.getElementById('endHour').value = '17';
        document.getElementById('endMinute').value = '00';
        document.getElementById('requestReason').value = '';
        
        document.querySelectorAll('.form-control').forEach(control => {
            control.classList.remove('is-valid', 'is-invalid');
        });
        
        const vacationHours = StudentUtils.calculateVacationHours();
        document.getElementById('requestDuration').textContent = 'Please select dates';
        document.getElementById('workingDays').textContent = '0ff';
        document.getElementById('balanceAfterRequest').textContent = vacationHours.remainingHours + 'ff';
        document.getElementById('balanceAfterRequest').className = 'summary-value';
        
        const requestPreview = document.getElementById('requestPreview');
        if (requestPreview) {
            requestPreview.style.display = 'none';
        }
        document.getElementById('balanceWarning').style.display = 'none';
        document.getElementById('balanceError').style.display = 'none';
        
        const advanceWarning = document.getElementById('advanceNoticeWarning');
        if (advanceWarning) {
            advanceWarning.remove();
        }
        
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
        
        if (!startDate || !endDate) {
            StudentUtils.showNotification('Please select start and end dates to preview', 'info');
            return;
        }
        
        const defaultStartHour = startHour || '09';
        const defaultStartMinute = startMinute || '00';
        const defaultEndHour = endHour || '17';
        const defaultEndMinute = endMinute || '00';
        
        const start = new Date(`${startDate}T${defaultStartHour}:${defaultStartMinute}:00`);
        const end = new Date(`${endDate}T${defaultEndHour}:${defaultEndMinute}:00`);
        
        if (end <= start) {
            StudentUtils.showNotification('End date must be after start date', 'warning');
            return;
        }
        
        const result = StudentUtils.calculateWorkingHours(start, end);
        const workingHours = result.workingHours;
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const vacationHours = StudentUtils.calculateVacationHours();
        
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
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                <strong>Preview Mode:</strong> This shows your request details. You can modify the form and preview again.
                            </div>
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
                                        <strong>Start:</strong> ${StudentUtils.formatDate(startDate)} at ${defaultStartHour}:${defaultStartMinute}
                                        ${!startHour ? ' <small class="text-muted">(default time)</small>' : ''}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>End:</strong> ${StudentUtils.formatDate(endDate)} at ${defaultEndHour}:${defaultEndMinute}
                                        ${!endHour ? ' <small class="text-muted">(default time)</small>' : ''}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Reason:</strong> ${reason || '<em class="text-muted">Not specified</em>'}
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
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close Preview</button>
                            <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Continue Editing</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('requestPreviewModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', previewHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('requestPreviewModal'));
        modal.show();
        
        document.getElementById('requestPreviewModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    window.resetForm = resetForm;
    window.previewRequest = previewRequest;
    
    // Initialize the application after all functions are defined
    init();
});
