import nodemailer from 'nodemailer';
import { brevo, brevoSender } from './brevoClient.js';

let transporter;
const getTransporter = () => {
    if (transporter) return transporter;
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        family: 4,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
    });
    return transporter;
};

const smtpConfigured = () =>
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && !/^\*+$/.test(process.env.SMTP_PASS);

/**
 * Send an email via SMTP (nodemailer); if SMTP is unavailable or fails
 * (e.g. hosts that block SMTP ports), fall back to the Brevo HTTP API.
 */
export const sendMail = async ({ to, subject, html }) => {
    let smtpError;
    if (smtpConfigured()) {
        try {
            const from = `"${process.env.BREVO_SENDER_NAME || 'Buddy Pair'}" <${process.env.SMTP_USER}>`;
            return await getTransporter().sendMail({ from, to, subject, html });
        } catch (err) {
            smtpError = err;
            console.error('SMTP send failed, trying Brevo fallback:', err.message);
        }
    }
    if (process.env.BREVO_API_KEY) {
        return brevo.transactionalEmails.sendTransacEmail({
            sender: brevoSender,
            to: [{ email: to }],
            subject,
            htmlContent: html,
        });
    }
    throw smtpError || new Error('No email transport configured (set SMTP_* or BREVO_API_KEY)');
};
