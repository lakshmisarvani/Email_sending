require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******' : 'Not Set');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"MERN Auth" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself as a test
      subject: 'Test Email from Nodemailer',
      html: '<h1>Hello from Nodemailer test</h1>',
    });

    console.log('Email sent:', info.response);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

sendTestEmail();
