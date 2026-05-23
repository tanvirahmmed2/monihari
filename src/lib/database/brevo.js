import { BrevoClient } from "@getbrevo/brevo";
import { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from "./secret";

/**
 * Utility to send transactional emails via Brevo
 * @param {Object} options - { toEmail, toName, subject, htmlContent }
 */
export const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
    try {
        const client = new BrevoClient({
            apiKey: BREVO_API_KEY
        });

        const smtpEmail = {
            subject: subject,
            htmlContent: htmlContent,
            sender: { 
                name: BREVO_SENDER_NAME,
                email: BREVO_SENDER_EMAIL
            },
            to: [{ email: toEmail, name: toName }]
        };

        const data = await client.transactionalEmails.sendTransacEmail(smtpEmail);
        return { success: true, data };
    } catch (error) {
        console.error("Brevo Email Error:", error);
        return { success: false, error };
    }
};