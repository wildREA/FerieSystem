// New Request page specific functionality

// Student data and requests for calculations
const studentData = {
    id: "STU001",
    name: "Emma Nielsen",
    email: "emma.nielsen@student.dk",
    course: "Computer Science",
    year: 3,
    totalVacationHours: 200
};

const requestsData = [
    {
        id: "REQ001",
        startDate: "2025-06-15T09:00:00",
        endDate: "2025-06-20T17:00:00",
        reason: "Family vacation",
        status: "pending",
        submitDate: "2025-06-10T10:15:00",
        hours: 40,
        isShortNotice: false
    },
    {
        id: "REQ002",
        startDate: "2025-05-20T09:00:00",
        endDate: "2025-05-23T17:00:00",
        reason: "Medical appointment",
        status: "approved",
        submitDate: "2025-05-15T14:20:00",
        hours: 32
    },
    {
        id: "REQ003",
        startDate: "2025-03-10T09:00:00",
        endDate: "2025-03-14T17:00:00",
        reason: "Spring break",
        status: "approved",
        submitDate: "2025-03-01T09:45:00",
        hours: 40
    },
    {
        id: "REQ004",
        startDate: "2025-07-01T09:00:00",
        endDate: "2025-07-08T17:00:00",
        reason: "Summer break",
        status: "denied",
        submitDate: "2025-06-05T09:45:00",
        hours: 56,
        denyReason: "Overlaps with mandatory courses"
    }
];

// Data manager for API calls
const DataManager = {
    init() {
        // Initialize any data management setup if needed
    },

    async addRequest(newRequest) {
        console.log('Adding new request:', newRequest);
        try {
            const requestData = {
                requestType: 'vacation',
                startDate: newRequest.startDate.split('T')[0],
                endDate: newRequest.endDate.split('T')[0],
                reason: newRequest.reason
            };
            
            console.log('Request data to submit:', requestData);
            await new Promise(resolve => setTimeout(resolve, 5000));

            const response = await fetch('/api/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Request submitted successfully:', result);
            return result;
        } catch (error) {
            console.error('Error submitting request:', error);
            throw error;
        }
    }
};

// Utility functions
const StudentUtils = {
    calculateVacationHours() {
        const approvedRequests = requestsData.filter(r => r.status === 'approved');
        const pendingRequests = requestsData.filter(r => r.status === 'pending');
        
        const usedHours = approvedRequests.reduce((sum, r) => sum + r.hours, 0);
        const pendingHours = pendingRequests.reduce((sum, r) => sum + r.hours, 0);
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
        const requestsBadge = document.getElementById('requestsBadge');
        if (requestsBadge) {
            const pendingCount = requestsData.filter(r => r.status === 'pending').length;
            requestsBadge.textContent = pendingCount;
            requestsBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    
    // Form elements
    const newRequestForm = document.getElementById('newRequestForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const requestReasonInput = document.getElementById('requestReason');

    // Initialize new request page
    init();

    function init() {
        DataManager.init();
        updateBalanceDisplay();
        setupEventListeners();
        setMinimumStartDateTime();
        StudentUtils.updateRequestsBadge();
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
        const minimumDateTime = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours = 2 days notice required
        
        // Ensure request starts during business hours
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
        const workingStartHour = 8; // 8:00 AM business hours start
        const workingEndHour = 17; // 5:00 PM business hours end
        const result = new Date(dateTime);
        
        const dayOfWeek = result.getDay(); // 0 = Sunday, 6 = Saturday
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

    function updateEndTimeFromStart() {
        console.log('updateEndTimeFromStart called');
        
        const startDate = startDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHourSelect = document.getElementById('endHour');
        const endMinuteSelect = document.getElementById('endMinute');
        
        console.log('Start date:', startDate);
        console.log('Start hour:', startHour);
        console.log('Start minute:', startMinute);
        console.log('End hour select:', endHourSelect);
        console.log('End minute select:', endMinuteSelect);
        console.log('End date input:', endDateInput);
        
        // Only update if start date and both start time fields have values
        if (!startDate || !startHour || !startMinute || !endHourSelect || !endMinuteSelect) {
            console.log('Missing required fields, returning');
            return;
        }
        
        console.log('Setting end date to:', startDate);
        // Set end date to same as start date
        if (endDateInput) {
            endDateInput.value = startDate;
            console.log('End date set to:', endDateInput.value);
        }
        
        // Create a date object with the start time
        const startTime = new Date();
        startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        
        // Add 15 minutes
        const endTime = new Date(startTime.getTime() + (15 * 60 * 1000));
        
        // Format the end time
        const endHour = endTime.getHours().toString().padStart(2, '0');
        const endMinute = endTime.getMinutes().toString().padStart(2, '0');
        
        console.log('Calculated end time:', endHour + ':' + endMinute);
        
        // Check if the calculated end time options exist in the selects
        const endHourOption = endHourSelect.querySelector(`option[value="${endHour}"]`);
        const endMinuteOption = endMinuteSelect.querySelector(`option[value="${endMinute}"]`);
        
        console.log('End hour option exists:', !!endHourOption);
        console.log('End minute option exists:', !!endMinuteOption);
        
        // Set the end time values if the options exist
        if (endHourOption) {
            endHourSelect.value = endHour;
            console.log('Set end hour to:', endHour);
        } else {
            // If hour doesn't exist (e.g., past business hours), set to last available hour
            const lastHourOption = endHourSelect.querySelector('option:last-child');
            if (lastHourOption) {
                endHourSelect.value = lastHourOption.value;
                console.log('Set end hour to last available:', lastHourOption.value);
            }
        }
        
        if (endMinuteOption) {
            endMinuteSelect.value = endMinute;
            console.log('Set end minute to:', endMinute);
        } else {
            // If exact minute doesn't exist, find the closest available minute
            const availableMinutes = Array.from(endMinuteSelect.options).map(opt => opt.value);
            const closestMinute = availableMinutes.reduce((closest, current) => {
                return Math.abs(parseInt(current) - parseInt(endMinute)) < Math.abs(parseInt(closest) - parseInt(endMinute)) ? current : closest;
            });
            endMinuteSelect.value = closestMinute;
            console.log('Set end minute to closest available:', closestMinute);
        }
        
        // Trigger calculation update after setting end date and time
        calculateRequestDuration();
        console.log('Called calculateRequestDuration');
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
        
        // Auto-update end time when start time changes (15 minutes later)
        safeAddListener('startHour', 'change', updateEndTimeFromStart);
        safeAddListener('startMinute', 'change', updateEndTimeFromStart);
        
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
        
        // Only require start and end dates for preview
        if (!startDate || !endDate) {
            StudentUtils.showNotification('Please select start and end dates to preview', 'info');
            return;
        }
        
        // Use default values for missing time fields
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
