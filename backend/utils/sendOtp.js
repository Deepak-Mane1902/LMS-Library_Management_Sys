import nodemailer from "nodemailer";

// ======================================================
// CREATE EMAIL TRANSPORTER
// ======================================================

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASS is missing from environment variables"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// ======================================================
// SEND OTP
// ======================================================

const sendOtp = async (email, otp) => {
  try {
    if (!email) {
      throw new Error("Recipient email is required");
    }

    if (!otp) {
      throw new Error("OTP is required");
    }

    const transporter = createTransporter();

    // Verify SMTP configuration first
    await transporter.verify();

    const mailOptions = {
      from: `"LMS Library Management System" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Your LMS Email Verification OTP",

      text: `Your LMS verification OTP is ${otp}. This OTP is valid for 5 minutes.`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background: #f7f7f7;
        ">

          <div style="
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
          ">

            <h2 style="
              margin-top: 0;
              color: #173f32;
            ">
              LMS Email Verification
            </h2>

            <p>
              Hello,
            </p>

            <p>
              Your One-Time Password (OTP) for creating your
              LMS Library Management System account is:
            </p>

            <div style="
              margin: 25px 0;
              text-align: center;
            ">

              <span style="
                display: inline-block;
                padding: 15px 30px;
                background: #173f32;
                color: #ffffff;
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 8px;
                border-radius: 8px;
              ">
                ${otp}
              </span>

            </div>

            <p>
              This OTP will expire in <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request this OTP, you can safely ignore
              this email.
            </p>

            <hr />

            <p style="
              color: #777;
              font-size: 12px;
            ">
              LMS Library Management System
            </p>

          </div>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("OTP email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error("OTP email sending error:", error);

    throw new Error(
      `Failed to send OTP email: ${error.message}`
    );
  }
};

export default sendOtp;