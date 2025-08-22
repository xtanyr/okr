import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a test account for development if no SMTP settings are provided
let transporter: nodemailer.Transporter;

if (process.env.NODE_ENV === 'production' || (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS)) {
  // Use real SMTP in production or when SMTP settings are provided
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.yandex.ru',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Using real SMTP email service');
} else {
  // Fallback to ethereal.email for development
  (async () => {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Using Ethereal test email service');
    console.log('Ethereal test account created:', testAccount);
  })();
}

// Function to send password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    const mailOptions = {
      from: `"OKR System" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@okr-system.com'}>`,
      to: email,
      subject: 'Восстановление пароля OKR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Восстановление пароля</h2>
          <p>Вы запросили сброс пароля для вашей учетной записи OKR.</p>
          <p>Пожалуйста, нажмите на кнопку ниже, чтобы установить новый пароль:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Сбросить пароль
            </a>
          </p>
          <p>Или скопируйте и вставьте следующую ссылку в браузер:</p>
          <p style="word-break: break-all; color: #3182ce;">${resetUrl}</p>
          <p>Ссылка действительна в течение 1 часа.</p>
          <p>Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #718096; font-size: 14px;">
            Это автоматическое сообщение, пожалуйста, не отвечайте на него.
          </p>
        </div>
      `,
      text: `Восстановление пароля OKR\n\n` +
            `Вы запросили сброс пароля для вашей учетной записи OKR.\n\n` +
            `Пожалуйста, перейдите по ссылке, чтобы установить новый пароль:\n${resetUrl}\n\n` +
            `Ссылка действительна в течение 1 часа.\n\n` +
            `Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо.`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // Log the email in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
