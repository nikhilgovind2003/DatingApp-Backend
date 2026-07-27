import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async ({ userEmail, token, userId }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        family: 4, // force IPv4 — Render's network can't route outbound IPv6 to Gmail, causing ETIMEDOUT
    });

    const mailOptions = {
        from: `"Buddy Pair Support" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Reset Your Password - Buddy Pair',
        html: `
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
                .button {
                    display: inline-block;
                    background-color: #4f46e5;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 25px 0;
                    box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
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
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                    <p>To set a new password, click the button below:</p>
                    <a href="${process.env.FRONTEND_URL}/reset-password?user=${userId}&token=${token}" class="button" style="color: white;">Reset Password</a>
                    <p>This link will expire in 5 minutes for your security.</p>
                </div>
                <div class="footer">
                    &copy; 2026 Buddy Pair. All rights reserved.
                </div>
            </div>
        </body>
        </html>`
    };

    await transporter.sendMail(mailOptions);
};