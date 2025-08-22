const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '/etc/okr/.env' });

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  // Create a test account if no SMTP settings are provided
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.yandex.ru',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || testAccount.user,
      pass: process.env.SMTP_PASS || testAccount.pass,
    },
  });

  const mailOptions = {
    from: `"OKR Backup System" <${process.env.SMTP_FROM || 'noreply@example.com'}>`,
    to,
    subject,
    text,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in other scripts
module.exports = { sendEmail };

// Run directly if this file is executed
if (require.main === module) {
  const [to, subject, text] = process.argv.slice(2);
  
  if (!to || !subject || !text) {
    console.error('Usage: node email-notification.js <to> <subject> <text>');
    process.exit(1);
  }

  sendEmail({ to, subject, text });
}
