import { BrevoClient } from '@getbrevo/brevo';

export const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

export const brevoSender = {
    name: process.env.BREVO_SENDER_NAME,
    email: process.env.BREVO_SENDER_EMAIL,
};
