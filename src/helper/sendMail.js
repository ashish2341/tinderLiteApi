const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      // service: process.env.SERVICE,
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

module.exports = sendEmail;
