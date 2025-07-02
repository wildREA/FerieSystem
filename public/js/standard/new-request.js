const CONFIG = {
    API_ENDPOINTS: {
        SUBMIT_REQUEST: '/api/submit-request',
        BALANCE: '/api/balance'
    },
    WORKING_HOURS: {
        START: 8,
        END: 17,
        DAILY_HOURS: 9
    },
    VALIDATION: {
        ADVANCE_NOTICE_HOURS: 48,
        LOW_BALANCE_THRESHOLD: 24
    },
    UI: {
        NOTIFICATION_TIMEOUT: 4000,
        MIN_END_TIME_OFFSET: 15
    },
    DEFAULTS: {
        TOTAL_ALLOCATED: 200,
        USED_HOURS: 0,
        PENDING_HOURS: 0
    }
};

class RequestApiService {
    static async submitRequest(requestData) {
        console.log('Submitting request:', requestData);
        
        try {
            const response = await fetch(CONFIG.API_ENDPOINTS.SUBMIT_REQUEST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            return await this._handleApiResponse(response);
        } catch (error) {
            console.error('Error submitting request:', error);
            // Throw a more specific error message
            throw new Error(`Network or server error: ${error.message}`);
        }
    }

    static async fetchBalanceData() {
        console.log('Fetching balance data from', CONFIG.API_ENDPOINTS.BALANCE);
        
        try {
            const response = await fetch(CONFIG.API_ENDPOINTS.BALANCE);
            const data = await this._handleApiResponse(response);
            
            if (data.success && data.balance) {
                return data.balance;
            }
            
            throw new Error('Invalid balance data structure received');
        } catch (error) {
            console.error('Error fetching balance data:', error);
            console.log('Using fallback balance data');
            return this._getFallbackBalanceData();
        }
    }

    static async _handleApiResponse(response) {
        const responseText = await response.text();
        console.log('API response:', { status: response.status, body: responseText });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        try {
            return JSON.parse(responseText);
        } catch (parseError) {
            // Handle cases where the response is not valid JSON
            throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
        }
    }

    static _getFallbackBalanceData() {
        return {
            totalAllocated: CONFIG.DEFAULTS.TOTAL_ALLOCATED,
            totalUsed: CONFIG.DEFAULTS.USED_HOURS,
            currentBalance: CONFIG.DEFAULTS.TOTAL_ALLOCATED,
            pendingHours: CONFIG.DEFAULTS.PENDING_HOURS
        };
    }
}

class VacationBalanceService {
    constructor() {
        this.currentBalanceData = null;
    }

    async getBalanceData() {
        if (!this.currentBalanceData) {
            this.currentBalanceData = await RequestApiService.fetchBalanceData();
        }
        return this.currentBalanceData;
    }

    async calculateVacationHours() {
        try {
            const balance = await this.getBalanceData();
            
            return {
                totalHours: balance.totalAllocated || 0,
                usedHours: Math.abs(balance.totalUsed || 0),
                pendingHours: balance.pendingHours || 0,
                remainingHours: balance.currentBalance || 0
            };
        } catch (error) {
            console.error('Error calculating vacation hours:', error);
            return this._getDefaultVacationHours();
        }
    }

    _getDefaultVacationHours() {
        return {
            totalHours: CONFIG.DEFAULTS.TOTAL_ALLOCATED,
            usedHours: CONFIG.DEFAULTS.USED_HOURS,
            pendingHours: CONFIG.DEFAULTS.PENDING_HOURS,
            remainingHours: CONFIG.DEFAULTS.TOTAL_ALLOCATED
        };
    }
}

class WorkingHoursCalculator {
    static calculate(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let totalWorkingHours = 0;
        const current = new Date(start);
        
        while (current < end) {
            if (this._isWorkingDay(current)) {
                const dayHours = this._calculateDayHours(current, start, end);
                totalWorkingHours += dayHours;
            }
            
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0);
        }
        
        return Math.round(totalWorkingHours * 100) / 100;
    }

    static _isWorkingDay(date) {
        const dayOfWeek = date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday (0) or Saturday (6)
    }

    static _calculateDayHours(current, start, end) {
        let dayStart, dayEnd;
        
        if (current.toDateString() === start.toDateString()) {
            const startHour = Math.max(start.getHours(), CONFIG.WORKING_HOURS.START);
            const startMinute = start.getHours() >= CONFIG.WORKING_HOURS.START ? start.getMinutes() : 0;
            dayStart = startHour + (startMinute / 60);
        } else {
            dayStart = CONFIG.WORKING_HOURS.START;
        }
        
        if (current.toDateString() === end.toDateString()) {
            const endHour = Math.min(end.getHours(), CONFIG.WORKING_HOURS.END);
            const endMinute = end.getHours() <= CONFIG.WORKING_HOURS.END ? end.getMinutes() : 0;
            dayEnd = endHour + (endMinute / 60);
        } else {
            dayEnd = CONFIG.WORKING_HOURS.END;
        }
        
        return Math.max(0, dayEnd - dayStart);
    }
}

class UIUtilities {
    static showNotification(message, type = 'info') {
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
        }, CONFIG.UI.NOTIFICATION_TIMEOUT);
    }

    static updateRequestsBadge() {
        const badgeElement = document.querySelector('.notification-badge');
        if (badgeElement) {
            badgeElement.style.display = 'none';
        }
    }

    static formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    static formatHoursToDays(hours) {
        if (hours === 0) return '0ff (0 days)';
        
        const days = hours / 8;
        
        if (hours < 1) {
            return `${hours.toFixed(2)}ff (${Math.round(hours * 60)} minutes)`;
        }
        
        if (hours < 4) {
            return `${hours.toFixed(2)}ff (${days.toFixed(2)} days)`;
        }
        
        if (days < 1) {
            return `${hours.toFixed(1)}ff (${days.toFixed(2)} days)`;
        }
        
        return `${hours.toFixed(1)}ff (${days.toFixed(1)} days)`;
    }
}

class DateTimeHelper {
    static getMinimumRequestDateTime() {
        const now = new Date();
        return new Date(now.getTime() + (CONFIG.VALIDATION.ADVANCE_NOTICE_HOURS * 60 * 60 * 1000));
    }

    static adjustToWorkingHours(dateTime) {
        const result = new Date(dateTime);
        const dayOfWeek = result.getDay();
        const hour = result.getHours();
        
        if (dayOfWeek === 0) { // Sunday
            result.setDate(result.getDate() + 1);
            result.setHours(CONFIG.WORKING_HOURS.START, 0, 0, 0);
        } else if (dayOfWeek === 6) { // Saturday
            result.setDate(result.getDate() + 2);
            result.setHours(CONFIG.WORKING_HOURS.START, 0, 0, 0);
        } else {
            if (hour < CONFIG.WORKING_HOURS.START) {
                result.setHours(CONFIG.WORKING_HOURS.START, 0, 0, 0);
            } else if (hour >= CONFIG.WORKING_HOURS.END) {
                result.setDate(result.getDate() + 1);
                result.setHours(CONFIG.WORKING_HOURS.START, 0, 0, 0);
                
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

    static isShortNotice(requestStartDateTime) {
        const now = new Date();
        const hoursDifference = (new Date(requestStartDateTime) - now) / (1000 * 60 * 60);
        return hoursDifference < CONFIG.VALIDATION.ADVANCE_NOTICE_HOURS;
    }
}

class NewRequestController {
    constructor() {
        this.balanceService = new VacationBalanceService();
        this.elements = {};
        this.bindElements();
    }

    bindElements() {
        this.elements = {
            form: document.getElementById('newRequestForm'),
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            startHour: document.getElementById('startHour'),
            startMinute: document.getElementById('startMinute'),
            endHour: document.getElementById('endHour'),
            endMinute: document.getElementById('endMinute'),
            requestReason: document.getElementById('requestReason'),
            currentBalance: document.getElementById('currentBalance'),
            balanceAfterRequest: document.getElementById('balanceAfterRequest'),
            requestDuration: document.getElementById('requestDuration'),
            workingDays: document.getElementById('workingDays'),
            submitButton: document.querySelector('button[type="submit"]')
        };
    }

    async init() {
        await this.updateBalanceDisplay();
        this.setupEventListeners();
        this.setMinimumStartDateTime();
        UIUtilities.updateRequestsBadge();
    }

    async updateBalanceDisplay() {
        try {
            const vacationHours = await this.balanceService.calculateVacationHours();
            
            this.safeUpdateElement('currentBalance', UIUtilities.formatHoursToDays(vacationHours.remainingHours));
            this.safeUpdateElement('balanceAfterRequest', `${vacationHours.remainingHours}ff`);
        } catch (error) {
            console.error('Error updating balance display:', error);
            UIUtilities.showNotification('Error loading balance data', 'warning');
        }
    }

    safeUpdateElement(id, value) {
        const element = this.elements[id] || document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    setMinimumStartDateTime() {
        const minimumDateTime = DateTimeHelper.getMinimumRequestDateTime();
        const adjustedDateTime = DateTimeHelper.adjustToWorkingHours(minimumDateTime);
        
        if (this.elements.startDate) {
            this.elements.startDate.value = adjustedDateTime.toISOString().split('T')[0];
        }
        
        this.setTimeSelectors(adjustedDateTime);
        
        // Auto-set end date/time after start date/time is set
        setTimeout(() => {
            this.updateEndTimeFromStart();
        }, 50);
    }

    setTimeSelectors(dateTime) {
        const hour = dateTime.getHours().toString().padStart(2, '0');
        const roundedMinute = Math.round(dateTime.getMinutes() / 15) * 15;
        const finalMinute = roundedMinute >= 60 ? 0 : roundedMinute;
        const minuteValue = finalMinute.toString().padStart(2, '0');

        if (this.elements.startHour) {
            const hourOption = this.elements.startHour.querySelector(`option[value="${hour}"]`);
            this.elements.startHour.value = hourOption ? hour : '09';
        }

        if (this.elements.startMinute) {
            const minuteOption = this.elements.startMinute.querySelector(`option[value="${minuteValue}"]`);
            this.elements.startMinute.value = minuteOption ? minuteValue : '00';
        }
    }

    updateEndTimeFromStart() {
        const { startDate, startHour, startMinute, endDate, endHour, endMinute } = this.elements;
        
        if (!startDate?.value || !startHour?.value || !startMinute?.value || !endHour || !endMinute) {
            return;
        }
        
        if (endDate) {
            endDate.value = startDate.value;
        }
        
        const startTime = new Date(`${startDate.value}T${startHour.value}:${startMinute.value}:00`);
        const endTime = new Date(startTime.getTime() + (CONFIG.UI.MIN_END_TIME_OFFSET * 60 * 1000));
        
        this.setEndTimeSelectors(endTime, startTime);
        this.calculateRequestDuration();
    }

    setEndTimeSelectors(endTime, startTime) {
        let endHourValue = endTime.getHours().toString().padStart(2, '0');
        let endMinuteValue = endTime.getMinutes().toString().padStart(2, '0');
        
        // If end time goes beyond the same day, adjust to end of working hours
        if (endTime.toDateString() !== startTime.toDateString()) {
            const adjustedEndTime = new Date(startTime);
            adjustedEndTime.setHours(CONFIG.WORKING_HOURS.END, 0, 0, 0);
            endHourValue = adjustedEndTime.getHours().toString().padStart(2, '0');
            endMinuteValue = adjustedEndTime.getMinutes().toString().padStart(2, '0');
        }
        
        this.selectClosestOption(this.elements.endHour, endHourValue);
        this.selectClosestOption(this.elements.endMinute, endMinuteValue);
    }

    selectClosestOption(selectElement, targetValue) {
        const targetOption = selectElement.querySelector(`option[value="${targetValue}"]`);
        
        if (targetOption) {
            selectElement.value = targetValue;
        } else {
            const availableValues = Array.from(selectElement.options).map(opt => opt.value);
            const closestValue = availableValues.reduce((closest, current) => {
                return Math.abs(parseInt(current) - parseInt(targetValue)) < 
                       Math.abs(parseInt(closest) - parseInt(targetValue)) ? current : closest;
            });
            selectElement.value = closestValue;
        }
    }

    setupEventListeners() {
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => this.handleRequestSubmission(e));
        }
        
        // Date and time change listeners
        const timeChangeElements = [
            'startDate', 'endDate', 'startHour', 'startMinute', 'endHour', 'endMinute'
        ];
        
        timeChangeElements.forEach(elementName => {
            this.safeAddListener(elementName, 'change', () => this.calculateRequestDuration());
        });
        
        // Start time change triggers end time update
        ['startDate', 'startHour', 'startMinute'].forEach(elementName => {
            this.safeAddListener(elementName, 'change', () => this.updateEndTimeFromStart());
        });
        
        // Validation triggers
        ['requestReason', 'startDate', 'startHour', 'startMinute', 'endDate'].forEach(elementName => {
            this.safeAddListener(elementName, this.getEventType(elementName), () => this.validateForm());
        });
        
        // Advance notice check
        ['startDate', 'startHour', 'startMinute'].forEach(elementName => {
            this.safeAddListener(elementName, 'change', () => this.checkAdvanceNotice());
        });
    }

    safeAddListener(elementName, event, handler) {
        const element = this.elements[elementName] || document.getElementById(elementName);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    getEventType(elementName) {
        return elementName === 'requestReason' ? 'input' : 'change';
    }

    async calculateRequestDuration() {
        const { startDate, endDate, startHour, startMinute, endHour, endMinute } = this.elements;
        
        try {
            const vacationHours = await this.balanceService.calculateVacationHours();
            this.resetDurationDisplay(vacationHours);
            
            if (!startDate?.value || !endDate?.value) {
                return;
            }
            
            const { start, end } = this.createDateTimeObjects();
            
            if (end <= start) {
                this.showDurationError('End must be after start');
                return;
            }
            
            this.updateDurationDisplay(start, end, vacationHours);
            this.updateRequestPreview();
            this.checkAdvanceNotice();
        } catch (error) {
            console.error('Error calculating request duration:', error);
            this.safeUpdateElement('requestDuration', 'Error calculating duration');
        }
    }

    resetDurationDisplay(vacationHours) {
        this.safeUpdateElement('requestDuration', 'Please select dates');
        this.safeUpdateElement('workingDays', '0ff');
        this.safeUpdateElement('balanceAfterRequest', vacationHours.remainingHours + 'ff');
        this.hideBalanceWarnings();
    }

    createDateTimeObjects() {
        const { startDate, endDate, startHour, startMinute, endHour, endMinute } = this.elements;
        
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        
        if (startHour?.value && startMinute?.value) {
            start.setHours(parseInt(startHour.value), parseInt(startMinute.value), 0, 0);
        }
        
        if (endHour?.value && endMinute?.value) {
            end.setHours(parseInt(endHour.value), parseInt(endMinute.value), 0, 0);
        }
        
        return { start, end };
    }

    showDurationError(message) {
        this.safeUpdateElement('requestDuration', message);
        const durationElement = this.elements.requestDuration || document.getElementById('requestDuration');
        if (durationElement) {
            durationElement.style.color = '#dc3545';
        }
    }

    updateDurationDisplay(start, end, vacationHours) {
        const totalHours = WorkingHoursCalculator.calculate(start, end);
        const totalCalendarDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        this.safeUpdateElement('requestDuration', `${totalCalendarDays} calendar day${totalCalendarDays !== 1 ? 's' : ''}`);
        this.resetDurationColor();
        this.safeUpdateElement('workingDays', UIUtilities.formatHoursToDays(totalHours));
        
        this.updateBalanceAfterRequest(vacationHours.remainingHours - totalHours);
    }

    resetDurationColor() {
        const durationElement = this.elements.requestDuration || document.getElementById('requestDuration');
        if (durationElement) {
            durationElement.style.color = '#ffffff';
        }
    }

    updateBalanceAfterRequest(balanceAfter) {
        const balanceElement = this.elements.balanceAfterRequest || document.getElementById('balanceAfterRequest');
        if (!balanceElement) return;
        
        balanceElement.textContent = UIUtilities.formatHoursToDays(balanceAfter);
        
        if (balanceAfter < 0) {
            balanceElement.className = 'summary-value insufficient';
            this.showElement('balanceError');
        } else if (balanceAfter <= CONFIG.VALIDATION.LOW_BALANCE_THRESHOLD) {
            balanceElement.className = 'summary-value warning';
            this.showElement('balanceWarning');
        } else {
            balanceElement.className = 'summary-value good';
        }
    }

    hideBalanceWarnings() {
        this.hideElement('balanceWarning');
        this.hideElement('balanceError');
    }

    showElement(id) {
        const element = document.getElementById(id);
        if (element) element.style.display = 'block';
    }

    hideElement(id) {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    }
    
    checkAdvanceNotice() {
        const { startDate, startHour, startMinute } = this.elements;
        
        this.removeExistingAdvanceWarning();
        
        if (!startDate?.value || !startHour?.value || !startMinute?.value) {
            return;
        }
        
        const requestStart = new Date(`${startDate.value}T${startHour.value}:${startMinute.value}:00`);
        
        if (DateTimeHelper.isShortNotice(requestStart)) {
            this.showAdvanceNoticeWarning(requestStart);
        }
    }

    removeExistingAdvanceWarning() {
        const existingWarning = document.getElementById('advanceNoticeWarning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }

    showAdvanceNoticeWarning(requestStart) {
        const now = new Date();
        const hoursDifference = (requestStart - now) / (1000 * 60 * 60);
        
        const warningHtml = `
            <div id="advanceNoticeWarning" class="alert alert-warning mt-3">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Short Notice:</strong> This request is less than ${CONFIG.VALIDATION.ADVANCE_NOTICE_HOURS} hours in advance. 
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

    updateRequestPreview() {
        const { startDate, endDate, startHour, startMinute, endHour, endMinute } = this.elements;
        const previewDiv = document.getElementById('requestPreview');
        
        if (!previewDiv) return;
        
        if (this.hasAllTimeValues()) {
            const startDateTime = `${UIUtilities.formatDate(startDate.value)} at ${startHour.value}:${startMinute.value}`;
            const endDateTime = `${UIUtilities.formatDate(endDate.value)} at ${endHour.value}:${endMinute.value}`;
            
            this.updatePreviewElements(startDateTime, endDateTime);
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    }

    hasAllTimeValues() {
        const { startDate, endDate, startHour, startMinute, endHour, endMinute } = this.elements;
        return startDate?.value && endDate?.value && startHour?.value && 
               startMinute?.value && endHour?.value && endMinute?.value;
    }

    updatePreviewElements(startDateTime, endDateTime) {
        this.safeUpdateElement('previewStart', startDateTime);
        this.safeUpdateElement('previewEnd', endDateTime);
        this.safeUpdateElement('previewType', 'Vacation Request');
    }

    validateForm() {
        const { startDate, endDate, requestReason, submitButton } = this.elements;
        
        let isValid = true;
        
        isValid = this.validateField(startDate, isValid);
        isValid = this.validateField(endDate, isValid);
        this.validateOptionalField(requestReason);
        
        if (submitButton) {
            submitButton.disabled = !isValid;
        }
        
        return isValid;
    }

    validateField(field, currentValidity) {
        if (!field) return currentValidity;
        
        if (!field.value) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            return false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            return currentValidity;
        }
    }

    validateOptionalField(field) {
        if (!field) return;
        
        field.classList.remove('is-invalid');
        if (field.value && field.value.trim().length > 0) {
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
        }
    }

    async handleRequestSubmission(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            UIUtilities.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        try {
            const requestData = await this.buildRequestData();
            const isValid = await this.validateRequestData(requestData);
            
            if (!isValid) return;
            
            if (!this.confirmSubmission(requestData)) return;
            
            await this.submitRequest(requestData);
            
        } catch (error) {
            console.error('Error submitting request:', error);
            UIUtilities.showNotification('Failed to submit request: ' + error.message, 'danger');
        }
    }

    async buildRequestData() {
        const { startDate, endDate, startHour, startMinute, endHour, endMinute, requestReason } = this.elements;
        
        const startDateTime = `${startDate.value}T${startHour.value}:${startMinute.value}:00`;
        const endDateTime = `${endDate.value}T${endHour.value}:${endMinute.value}:00`;
        
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const workingHours = WorkingHoursCalculator.calculate(start, end);
        const isShortNotice = DateTimeHelper.isShortNotice(startDateTime);
        
        return {
            requestType: 'vacation',
            startDateTime,
            endDateTime,
            reason: requestReason.value,
            status: 'pending',
            submitDate: new Date().toISOString(),
            hours: workingHours,
            isShortNotice,
            totalCalendarDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        };
    }

    async validateRequestData(requestData) {
        const start = new Date(requestData.startDateTime);
        const end = new Date(requestData.endDateTime);
        
        if (end <= start) {
            UIUtilities.showNotification('End date must be after start date', 'danger');
            return false;
        }
        
        const vacationHours = await this.balanceService.calculateVacationHours();
        if (requestData.hours > vacationHours.remainingHours) {
            UIUtilities.showNotification('Request exceeds available vacation hours', 'danger');
            return false;
        }
        
        return true;
    }

    confirmSubmission(requestData) {
        let confirmMessage = `Submit vacation request for ${UIUtilities.formatHoursToDays(requestData.hours)}?`;
        
        if (requestData.isShortNotice) {
            confirmMessage += `\n\nNote: This is a short notice request (less than ${CONFIG.VALIDATION.ADVANCE_NOTICE_HOURS} hours in advance).`;
        }
        
        return confirm(confirmMessage);
    }

    async submitRequest(requestData) {
        this.setSubmitButtonLoading(true);
        
        try {
            await RequestApiService.submitRequest(requestData);
            this.resetForm();
            
            let successMessage = 'Request submitted successfully!';
            if (requestData.isShortNotice) {
                successMessage += ' (Short notice - may take longer to approve)';
            }
            UIUtilities.showNotification(successMessage, 'success');
            
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    setSubmitButtonLoading(isLoading) {
        const { submitButton } = this.elements;
        if (!submitButton) return;
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.setAttribute('data-original-text', submitButton.textContent);
            submitButton.textContent = 'Submitting...';
        } else {
            submitButton.disabled = false;
            const originalText = submitButton.getAttribute('data-original-text');
            if (originalText) {
                submitButton.textContent = originalText;
                submitButton.removeAttribute('data-original-text');
            }
        }
    }

    resetForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }
        
        this.setMinimumStartDateTime();
        this.resetFormFields();
        this.resetFormValidation();
        this.resetDisplayElements();
        this.removeExistingAdvanceWarning();
    }

    resetFormFields() {
        const { endDate, endHour, endMinute, requestReason } = this.elements;
        
        if (endDate) endDate.value = '';
        if (endHour) endHour.value = '17';
        if (endMinute) endMinute.value = '00';
        if (requestReason) requestReason.value = '';
    }

    resetFormValidation() {
        document.querySelectorAll('.form-control').forEach(control => {
            control.classList.remove('is-valid', 'is-invalid');
        });
        
        if (this.elements.submitButton) {
            this.elements.submitButton.disabled = false;
        }
    }

    async resetDisplayElements() {
        const vacationHours = await this.balanceService.calculateVacationHours();
        
        this.safeUpdateElement('requestDuration', 'Please select dates');
        this.safeUpdateElement('workingDays', '0ff');
        this.safeUpdateElement('balanceAfterRequest', vacationHours.remainingHours + 'ff');
        
        const balanceElement = this.elements.balanceAfterRequest || document.getElementById('balanceAfterRequest');
        if (balanceElement) {
            balanceElement.className = 'summary-value';
        }
        
        this.hideElement('requestPreview');
        this.hideBalanceWarnings();
    }

    async previewRequest() {
        const { startDate, endDate, startHour, startMinute, endHour, endMinute, requestReason } = this.elements;
        
        if (!startDate?.value || !endDate?.value) {
            UIUtilities.showNotification('Please select start and end dates to preview', 'info');
            return;
        }
        
        const defaultStartHour = startHour?.value || '09';
        const defaultStartMinute = startMinute?.value || '00';
        const defaultEndHour = endHour?.value || '17';
        const defaultEndMinute = endMinute?.value || '00';
        
        const start = new Date(`${startDate.value}T${defaultStartHour}:${defaultStartMinute}:00`);
        const end = new Date(`${endDate.value}T${defaultEndHour}:${defaultEndMinute}:00`);
        
        if (end <= start) {
            UIUtilities.showNotification('End date must be after start date', 'warning');
            return;
        }
        
        const workingHours = WorkingHoursCalculator.calculate(start, end);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const vacationHours = await this.balanceService.calculateVacationHours();
        const isShortNotice = DateTimeHelper.isShortNotice(`${startDate.value}T${defaultStartHour}:${defaultStartMinute}:00`);
        
        this.showPreviewModal({
            startDate: startDate.value,
            endDate: endDate.value,
            startHour: defaultStartHour,
            startMinute: defaultStartMinute,
            endHour: defaultEndHour,
            endMinute: defaultEndMinute,
            reason: requestReason?.value || '',
            workingHours,
            totalDays,
            vacationHours,
            isShortNotice,
            hasDefaultTimes: !startHour?.value || !endHour?.value
        });
    }

    showPreviewModal(data) {
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
                            ${data.isShortNotice ? `
                                <div class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Short Notice:</strong> This request is less than ${CONFIG.VALIDATION.ADVANCE_NOTICE_HOURS} hours in advance.
                                </div>
                            ` : ''}
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">Request Details</h6>
                                    <div class="preview-detail">
                                        <strong>Type:</strong> Vacation Request
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Start:</strong> ${UIUtilities.formatDate(data.startDate)} at ${data.startHour}:${data.startMinute}
                                        ${data.hasDefaultTimes ? ' <small class="text-muted">(default time)</small>' : ''}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>End:</strong> ${UIUtilities.formatDate(data.endDate)} at ${data.endHour}:${data.endMinute}
                                        ${data.hasDefaultTimes ? ' <small class="text-muted">(default time)</small>' : ''}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Reason:</strong> ${data.reason || '<em class="text-muted">Not specified</em>'}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary">Duration Breakdown</h6>
                                    <div class="preview-detail">
                                        <strong>Total Calendar Days:</strong> ${data.totalDays}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Working Hours:</strong> ${UIUtilities.formatHoursToDays(data.workingHours)}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Balance After:</strong> ${UIUtilities.formatHoursToDays(data.vacationHours.remainingHours - data.workingHours)}
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


}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    const controller = new NewRequestController();
    controller.init().catch(error => {
        console.error('Failed to initialize new request controller:', error);
        UIUtilities.showNotification('Failed to initialize application', 'danger');
    });
    
    // Expose reset and preview functions globally for backward compatibility
    window.resetForm = () => controller.resetForm();
    window.previewRequest = () => controller.previewRequest();
});
