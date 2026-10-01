import { createTransport } from "nodemailer";

const sendOtp = async (email, otp) => {

    const transporter = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Test Gmail authentication
    await transporter.verify();

    console.log("Gmail SMTP authentication successful");

    await transporter.sendMail({
        from: `"LMS App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        html: `
            <h2>Your OTP is ${otp}</h2>
            <p>This OTP is valid for a limited time.</p>
        `
    });

    console.log("OTP email sent successfully");
};

export default sendOtp;