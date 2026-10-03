import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtp = async (email, otp) => {
    try {

        // --------------------------------------------------
        // Check environment variables
        // --------------------------------------------------

        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is missing");
        }

        if (!process.env.EMAIL_FROM) {
            throw new Error("EMAIL_FROM is missing");
        }

        console.log("=================================");
        console.log("EMAIL CONFIG CHECK");

        console.log(
            "EMAIL_FROM:",
            process.env.EMAIL_FROM
        );

        console.log(
            "RESEND_API_KEY:",
            process.env.RESEND_API_KEY ? "AVAILABLE" : "MISSING"
        );

        console.log("=================================");


        // --------------------------------------------------
        // Send OTP email using Resend
        // --------------------------------------------------

        const { data, error } = await resend.emails.send({

            from: process.env.EMAIL_FROM,

            to: [email],

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
                            This OTP will expire in
                            <strong>5 minutes</strong>.
                        </p>

                        <p>
                            If you did not request this OTP,
                            you can safely ignore this email.
                        </p>

                        <hr />

                        <p style="
                            font-size: 12px;
                            color: #777;
                        ">
                            This is an automated email from
                            LMS Library Management System.
                        </p>

                    </div>
                </div>
            `,
        });


        // --------------------------------------------------
        // Check Resend response
        // --------------------------------------------------

        if (error) {

            console.error("=================================");
            console.error("RESEND ERROR");
            console.error("Status:", error.statusCode);
            console.error("Message:", error.message);
            console.error("Name:", error.name);
            console.error("=================================");

            throw new Error(
                error.message || "Failed to send OTP email"
            );
        }


        // --------------------------------------------------
        // Success
        // --------------------------------------------------

        console.log("=================================");
        console.log("OTP EMAIL SENT SUCCESSFULLY");
        console.log("Message ID:", data?.id);
        console.log("=================================");

        return {
            success: true,
            messageId: data?.id,
        };

    } catch (error) {

        // --------------------------------------------------
        // Error handling
        // --------------------------------------------------

        console.error("=================================");
        console.error("OTP EMAIL ERROR");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Response:", error.response);
        console.error("=================================");

        throw error;
    }
};


// IMPORTANT:
// Keep DEFAULT export exactly as before.
// Your authController.js can continue using:
//
// import sendOtp from "../utils/sendOtp.js";

export default sendOtp;