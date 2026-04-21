const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendNotification = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"DGETI Tracker" <no-reply@dgeti.gob>',
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error('Email failed:', err);
    return false;
  }
};

module.exports = { sendNotification };
