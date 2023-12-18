const {
    EMAIL_FROM,
    EMAIL_PASS,
} = require("../config/keys");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

// Function to send a verification email
const sendVerificationEmail = async (email, subject, message, msg) => {
    // Create a transporter using nodemailer (replace with your actual email service configuration)
    const transporter = nodemailer.createTransport(
        smtpTransport({
            service: "gmail",
            auth: {
                user: EMAIL_FROM, // Your Gmail email address
                pass: EMAIL_PASS, // Your Gmail password or App Password
            },
        })
    );

    const mailOptions = {
        from: EMAIL_FROM,
        to: email,
        subject: `${subject}`,
        text: `${message}`,
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
};

module.exports={
    sendVerificationEmail,
}