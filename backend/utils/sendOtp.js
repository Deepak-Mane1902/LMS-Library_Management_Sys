import nodemailer from "nodemailer";

const sendOtp = async (email, otp) => {
  try {
    // --------------------------------------------------
    // Check environment variables
    // --------------------------------------------------
    if (!process.env.EMAIL_USER) {
      throw new Error("EMAIL_USER is missing");
    }

    if (!process.env.EMAIL_PASS) {
      throw new Error("EMAIL_PASS is missing");
    }

    console.log("=================================");
    console.log("EMAIL CONFIG CHECK");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "AVAILABLE" : "MISSING"
    );
    console.log("=================================");

    // --------------------------------------------------
    // Create Gmail transporter
    // --------------------------------------------------
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    // --------------------------------------------------
    // Verify SMTP connection
    // --------------------------------------------------
    await transporter.verify();

    console.log("SMTP connection verified successfully");

    // --------------------------------------------------
    // Send OTP email
    // --------------------------------------------------
    const info = await transporter.sendMail({
      from: `"LMS Library Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your LMS Verification OTP",

      text: `Your LMS verification OTP is ${otp}. This OTP will expire in 5 minutes.`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background: #f5f5f5;
        ">

          <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
          ">

            <h2 style="margin-bottom: 10px;">
              LMS Library Management System
            </h2>

            <p>
              Hello,
            </p>

            <p>
              Your OTP for verifying your LMS account is:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px;
              margin: 20px 0;
              background: #f1f5f9;
              text-align: center;
              border-radius: 8px;
            ">
              ${otp}
            </div>

            <p>
              This OTP will expire in <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request this OTP, you can safely ignore this email.
            </p>

            <hr />

            <p style="
              font-size: 12px;
              color: #777;
            ">
              This is an automated email from LMS Library Management System.
            </p>

          </div>

        </div>
      `,
    });

    console.log("OTP email sent successfully");
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error("=================================");
    console.error("OTP EMAIL ERROR");
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("Message:", error.message);
    console.error("=================================");

    throw error;
  }
};

export default sendOtp;