import nodemailer from 'nodemailer';


// ========================================
// Validate Email Configuration
// ========================================

if (!process.env.EMAIL_USER) {
    console.warn('WARNING: EMAIL_USER is not configured');
}

if (!process.env.EMAIL_PASS) {
    console.warn('WARNING: EMAIL_PASS is not configured');
}


// ========================================
// Nodemailer Transporter
// ========================================

const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    // Prevent very long requests on Render
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});


// ========================================
// Send OTP
// ========================================

const sendOtp = async (email, otp) => {

    try {

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error(
                'EMAIL_USER or EMAIL_PASS is missing in environment variables'
            );
        }

        const mailOptions = {
            from: `"LMS Library Management System" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: 'LMS Email Verification OTP',

            text: `
Hello,

Your LMS verification OTP is:

${otp}

This OTP will expire in 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
LMS Library Management System
            `,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                ">

                    <h2>LMS Email Verification</h2>

                    <p>Hello,</p>

                    <p>
                        Your verification OTP is:
                    </p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        padding: 15px;
                        text-align: center;
                        background: #f5f5f5;
                        border-radius: 8px;
                        margin: 20px 0;
                    ">
                        ${otp}
                    </div>

                    <p>
                        This OTP will expire in <strong>5 minutes</strong>.
                    </p>

                    <p>
                        If you did not request this OTP, please ignore this email.
                    </p>

                    <br>

                    <p>
                        Regards,<br>
                        <strong>LMS Library Management System</strong>
                    </p>

                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('OTP email sent successfully');
        console.log('Message ID:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {

        console.error('OTP Email Error');
        console.error('Code:', error.code);
        console.error('Command:', error.command);
        console.error('Response:', error.response);
        console.error('Message:', error.message);

        throw error;
    }
};

export default sendOtp;