# PHPMailer Email Setup Guide

## Overview
The system now automatically sends email notifications to instructors when students submit vacation requests.

## Email Configuration

### 1. Update .env File
Configure the following variables in your `.env` file:

```properties
# Email Configuration
MAIL_HOST=smtp.gmail.com                          # SMTP server (Gmail example)
MAIL_PORT=587                                     # SMTP port (587 for TLS, 465 for SSL)
MAIL_USERNAME=your_email@gmail.com                # Your sender email
MAIL_PASSWORD=your_app_password_here              # App password (not your regular password)
MAIL_ENCRYPTION=tls                               # Encryption method (tls or ssl)
MAIL_FROM_ADDRESS=your_email@gmail.com            # From email address
MAIL_FROM_NAME="FerieSystem - Vacation Requests" # From name displayed in emails
INSTRUCTOR_EMAIL=instructor@school.com            # Recipient email for notifications
```

### 2. Gmail Setup (if using Gmail)
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this app password in the `MAIL_PASSWORD` field (not your regular Gmail password)

### 3. Other Email Providers
- **Outlook/Hotmail**: `MAIL_HOST=smtp.office365.com`, `MAIL_PORT=587`
- **Yahoo**: `MAIL_HOST=smtp.mail.yahoo.com`, `MAIL_PORT=587`
- **Custom SMTP**: Use your provider's SMTP settings

## Email Features

### When Emails Are Sent
- **Immediately** when a student submits a vacation request
- No emails are sent for request approvals/denials (this can be added later if needed)

### Email Content Includes
- ✅ Student name
- ✅ Request start date and time
- ✅ Request end date and time
- ✅ Duration in hours
- ✅ Reason for vacation (if provided)
- ✅ Submission timestamp
- ✅ Professional HTML formatting with emojis

### Email Format
- **HTML**: Rich formatting with colors and professional layout
- **Plain Text**: Fallback for email clients that don't support HTML

## Technical Details

### Files Modified/Added
1. **New**: `app/Services/EmailService.php` - Handles all email functionality
2. **Modified**: `app/Controllers/RequestController.php` - Added email sending on request submission
3. **Modified**: `.env` - Added email configuration variables
4. **Modified**: `composer.json` - Added PHPMailer dependency

### Error Handling
- Email failures are logged but don't prevent request submission
- All email errors are logged to PHP error logs
- If email configuration is missing, errors are logged but system continues working

## Testing

To test if emails are working:
1. Configure your email settings in `.env`
2. Submit a test vacation request through the system
3. Check if the instructor receives the email
4. Check PHP error logs for any email-related errors

## Troubleshooting

### Common Issues
1. **"Authentication failed"**: Check username/password, use app passwords for Gmail
2. **"Connection refused"**: Check MAIL_HOST and MAIL_PORT settings
3. **"Could not instantiate mail function"**: Ensure PHPMailer is installed via Composer

### Debug Steps
1. Check PHP error logs for detailed error messages
2. Verify `.env` file has correct email settings
3. Test with a simple email provider like Gmail first
4. Ensure your server can make outbound SMTP connections (port 587/465)

## Security Notes
- Never commit your actual email passwords to version control
- Use app passwords instead of regular passwords when possible
- Keep your `.env` file in `.gitignore`
