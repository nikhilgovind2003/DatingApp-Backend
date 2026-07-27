import { brevo, brevoSender } from "./brevoClient.js";

export const verificationEmail = async ({ userEmail, otp }) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender: brevoSender,
            to: [{ email: userEmail }],
            subject: 'Verify Your Email - Buddy Pair OTP',
            htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 12px;
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .content {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    text-align: center;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    color: #4f46e5;
                    margin: 20px 0;
                    padding: 10px;
                    border: 2px dashed #4f46e5;
                    border-radius: 8px;
                    display: inline-block;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #6b7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Buddy Pair</h1>
                </div>
                <div class="content">
                    <h2>Email Verification</h2>
                    <p>Thank you for signing up for Buddy Pair! Please use the following One-Time Password (OTP) to complete your registration:</p>
                    <div class="otp-code">${otp}</div>
                    <p>This code is valid for 10 minutes. If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2026 Buddy Pair. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `,
        });
        console.log('OTP Email sent successfully to', userEmail);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Error sending OTP email: ' + error.message);
    }
};
