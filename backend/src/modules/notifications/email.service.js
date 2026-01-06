/**
 * Email Service
 * Handles all email notifications using Resend
 */
const { Resend } = require('resend');
const logger = require('../../utils/logger');

// Initialize Resend client (lazy initialization)
let resendClient = null;

/**
 * Get or initialize the Resend client
 * @returns {Resend|null} - Resend client or null if not configured
 */
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not configured - email notifications disabled');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
};

/**
 * Default from email address
 */
// TODO: Change back to notifications@criton.ai once domain is verified in Resend
const DEFAULT_FROM = 'CRITON.AI <onboarding@resend.dev>';

/**
 * Default password reset token expiry in hours
 */
const DEFAULT_PASSWORD_RESET_EXPIRY_HOURS = 1;

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (optional)
 * @param {string} [options.from] - From address (optional, uses default)
 * @returns {Promise<Object>} - Send result
 */
const sendEmail = async ({ to, subject, html, text, from = DEFAULT_FROM }) => {
  const client = getResendClient();

  if (!client) {
    logger.warn(`Email NOT sent to ${to}: ${subject} (RESEND_API_KEY not configured)`);
    return { success: false, reason: 'RESEND_NOT_CONFIGURED' };
  }

  try {
    const result = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    logger.info(`Email sent successfully to ${to}: ${subject}`);
    return { success: true, id: result.data?.id };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Generate HTML for new appointment email
 * @param {Object} data - Appointment data
 * @param {string} data.businessName - Business name
 * @param {string} data.customerName - Customer name
 * @param {string} data.customerPhone - Customer phone
 * @param {string} data.serviceName - Service name
 * @param {string} data.employeeName - Employee name
 * @param {string} data.appointmentDate - Formatted date (e.g., "Monday, January 15, 2025")
 * @param {string} data.appointmentTime - Formatted time (e.g., "2:00 PM")
 * @param {number} data.duration - Duration in minutes
 * @returns {string} - HTML content
 */
const generateNewAppointmentHtml = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment Booked</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Appointment Booked</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Hi there,</p>
    <p>A new appointment has been booked at <strong>${data.businessName}</strong>.</p>

    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; color: #667eea;">Appointment Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer:</strong></td>
          <td style="padding: 8px 0;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
          <td style="padding: 8px 0;">${data.customerPhone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Service:</strong></td>
          <td style="padding: 8px 0;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>With:</strong></td>
          <td style="padding: 8px 0;">${data.employeeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">${data.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;">${data.appointmentTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Duration:</strong></td>
          <td style="padding: 8px 0;">${data.duration} minutes</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">
      This is an automated notification from CRITON.AI. You can manage your notification preferences in your dashboard settings.
    </p>
  </div>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Powered by <a href="https://criton.ai" style="color: #667eea; text-decoration: none;">CRITON.AI</a></p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate HTML for appointment cancellation email
 * @param {Object} data - Cancellation data
 * @param {string} data.businessName - Business name
 * @param {string} data.customerName - Customer name
 * @param {string} data.serviceName - Service name
 * @param {string} data.appointmentDate - Original date
 * @param {string} data.appointmentTime - Original time
 * @param {string} [data.cancellationReason] - Reason for cancellation
 * @returns {string} - HTML content
 */
const generateCancellationHtml = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Cancelled</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Appointment Cancelled</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Hi there,</p>
    <p>An appointment has been cancelled at <strong>${data.businessName}</strong>.</p>

    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; color: #ef4444;">Cancelled Appointment</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer:</strong></td>
          <td style="padding: 8px 0;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Service:</strong></td>
          <td style="padding: 8px 0;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">${data.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;">${data.appointmentTime}</td>
        </tr>
        ${data.cancellationReason ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Reason:</strong></td>
          <td style="padding: 8px 0;">${data.cancellationReason}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">
      This is an automated notification from CRITON.AI. You can manage your notification preferences in your dashboard settings.
    </p>
  </div>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Powered by <a href="https://criton.ai" style="color: #667eea; text-decoration: none;">CRITON.AI</a></p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate HTML for daily digest email
 * @param {Object} data - Digest data
 * @param {string} data.businessName - Business name
 * @param {string} data.date - Report date
 * @param {Array} data.todayAppointments - Today's appointments
 * @param {Array} data.tomorrowAppointments - Tomorrow's appointments
 * @param {Object} data.stats - Summary statistics
 * @returns {string} - HTML content
 */
const generateDailyDigestHtml = (data) => {
  const formatAppointmentRow = (apt) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${apt.time}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${apt.customerName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${apt.serviceName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${apt.employeeName}</td>
    </tr>
  `;

  const todaySection = data.todayAppointments.length > 0 ? `
    <h3 style="color: #667eea; margin-top: 30px;">Today's Appointments (${data.todayAppointments.length})</h3>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left; color: #6b7280;">Time</th>
          <th style="padding: 10px; text-align: left; color: #6b7280;">Customer</th>
          <th style="padding: 10px; text-align: left; color: #6b7280;">Service</th>
          <th style="padding: 10px; text-align: left; color: #6b7280;">With</th>
        </tr>
      </thead>
      <tbody>
        ${data.todayAppointments.map(formatAppointmentRow).join('')}
      </tbody>
    </table>
  ` : `
    <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 20px;">
      <p style="margin: 0; color: #92400e;">No appointments scheduled for today.</p>
    </div>
  `;

  const tomorrowSection = data.tomorrowAppointments.length > 0 ? `
    <h3 style="color: #667eea; margin-top: 30px;">Tomorrow's Appointments (${data.tomorrowAppointments.length})</h3>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left; color: #6b7280;">Time</th>
          <th style="padding: 10px; text-align: left; color: #6b7280;">Customer</th>
          <th style="padding: 10px; text-align: left; color: #6b7280;">Service</th>
          <th style="padding: 10px; text-align: left; color: #6b7280;">With</th>
        </tr>
      </thead>
      <tbody>
        ${data.tomorrowAppointments.map(formatAppointmentRow).join('')}
      </tbody>
    </table>
  ` : `
    <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin-top: 20px;">
      <p style="margin: 0; color: #6b7280;">No appointments scheduled for tomorrow.</p>
    </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Daily Digest</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">${data.date}</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Good morning! Here's your daily summary for <strong>${data.businessName}</strong>.</p>

    ${data.stats ? `
    <div style="display: flex; gap: 15px; margin: 20px 0;">
      <div style="flex: 1; background: white; border-radius: 8px; padding: 15px; text-align: center; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: bold; color: #667eea;">${data.stats.todayCount || 0}</div>
        <div style="font-size: 12px; color: #6b7280;">Today</div>
      </div>
      <div style="flex: 1; background: white; border-radius: 8px; padding: 15px; text-align: center; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: bold; color: #667eea;">${data.stats.tomorrowCount || 0}</div>
        <div style="font-size: 12px; color: #6b7280;">Tomorrow</div>
      </div>
    </div>
    ` : ''}

    ${todaySection}
    ${tomorrowSection}

    <p style="margin-top: 30px; margin-bottom: 0; color: #6b7280; font-size: 14px;">
      This is an automated notification from CRITON.AI. You can manage your notification preferences in your dashboard settings.
    </p>
  </div>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Powered by <a href="https://criton.ai" style="color: #667eea; text-decoration: none;">CRITON.AI</a></p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Send new appointment notification email to business owner
 * @param {string} toEmail - Business owner email
 * @param {Object} appointmentData - Appointment details
 * @returns {Promise<Object>} - Send result
 */
const sendNewAppointmentEmail = async (toEmail, appointmentData) => {
  const html = generateNewAppointmentHtml(appointmentData);
  const subject = `New Appointment: ${appointmentData.customerName} - ${appointmentData.serviceName}`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
};

/**
 * Send appointment cancellation notification email to business owner
 * @param {string} toEmail - Business owner email
 * @param {Object} cancellationData - Cancellation details
 * @returns {Promise<Object>} - Send result
 */
const sendCancellationEmail = async (toEmail, cancellationData) => {
  const html = generateCancellationHtml(cancellationData);
  const subject = `Appointment Cancelled: ${cancellationData.customerName} - ${cancellationData.appointmentDate}`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
};

/**
 * Send daily digest email to business owner
 * @param {string} toEmail - Business owner email
 * @param {Object} digestData - Digest data
 * @returns {Promise<Object>} - Send result
 */
const sendDailyDigestEmail = async (toEmail, digestData) => {
  const html = generateDailyDigestHtml(digestData);
  const subject = `Daily Digest: ${digestData.businessName} - ${digestData.date}`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
};

/**
 * Generate HTML for password reset email
 * @param {Object} data - Reset data
 * @param {string} data.resetUrl - Password reset URL
 * @param {number} data.expiryHours - Hours until expiry (default 1)
 * @returns {string} - HTML content
 */
const generatePasswordResetHtml = (data) => {
  const expiryHours = data.expiryHours || DEFAULT_PASSWORD_RESET_EXPIRY_HOURS;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Hi there,</p>
    <p>We received a request to reset your password for your CRITON.AI account. If you didn't make this request, you can safely ignore this email.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      This password reset link will expire in <strong>${expiryHours} hour${expiryHours > 1 ? 's' : ''}</strong> for security reasons.
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Security tip:</strong> If you didn't request this password reset, please secure your account immediately by changing your password.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="word-break: break-all; color: #667eea; font-size: 12px;">
      ${data.resetUrl}
    </p>

    <p style="margin-top: 30px; margin-bottom: 0; color: #6b7280; font-size: 14px;">
      This is an automated notification from CRITON.AI.
    </p>
  </div>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Powered by <a href="https://criton.ai" style="color: #667eea; text-decoration: none;">CRITON.AI</a></p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Send password reset email to user
 * @param {string} toEmail - User email
 * @param {Object} resetData - Reset details
 * @param {string} resetData.resetUrl - Password reset URL
 * @param {number} resetData.expiryHours - Hours until expiry (default 1)
 * @returns {Promise<Object>} - Send result
 */
const sendPasswordResetEmail = async (toEmail, resetData) => {
  const html = generatePasswordResetHtml(resetData);
  const subject = 'Reset Your CRITON.AI Password';

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
};

/**
 * Check if email service is configured
 * @returns {boolean} - True if Resend is configured
 */
const isEmailServiceConfigured = () => {
  return !!process.env.RESEND_API_KEY;
};

module.exports = {
  sendEmail,
  sendNewAppointmentEmail,
  sendCancellationEmail,
  sendDailyDigestEmail,
  sendPasswordResetEmail,
  isEmailServiceConfigured,
  generateNewAppointmentHtml,
  generateCancellationHtml,
  generateDailyDigestHtml,
  generatePasswordResetHtml,
};
