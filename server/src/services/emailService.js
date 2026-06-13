const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // For development, just log the email
  console.log('📧 Email would be sent:', {
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
  
  // In production, configure actual email service
  if (process.env.NODE_ENV === 'production') {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });
  }
};

const sendBookingConfirmation = async (user, booking) => {
  const message = `Your booking for ${booking.slotId?.title} is confirmed!`;
  await sendEmail({
    email: user.email,
    subject: 'Booking Confirmation - Smart Parking',
    message,
  });
};

module.exports = { sendEmail, sendBookingConfirmation };
