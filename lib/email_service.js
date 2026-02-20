
import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Default sender — update this after verifying your domain on Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'NEET Coach <onboarding@resend.dev>';

/**
 * Send an email using Resend
 * Falls back to console.log if RESEND_API_KEY is not set
 * 
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML body
 * @returns {boolean} true if sent successfully
 */
export async function sendEmail(to, subject, htmlContent) {
    if (!to || !subject || !htmlContent) {
        console.error('Email Service Error: Missing parameters');
        return false;
    }

    // If Resend is not configured, fall back to mock
    if (!resend) {
        console.log(`
        📧 --- MOCK EMAIL (No RESEND_API_KEY) ---
        To: ${to}
        Subject: ${subject}
        Content Preview: ${htmlContent.substring(0, 100)}...
        --------------------------
        `);
        return true;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error('Resend Error:', error);
            return false;
        }

        console.log(`📧 Email sent to ${to} — ID: ${data.id}`);
        return true;
    } catch (err) {
        console.error('Email send failed:', err.message);
        return false;
    }
}

/**
 * Send a batch of emails (more efficient for parent reports)
 * 
 * @param {Array<{to: string, subject: string, html: string}>} emails
 * @returns {boolean}
 */
export async function sendBatchEmails(emails) {
    if (!resend) {
        console.log(`📧 MOCK: Would send ${emails.length} emails`);
        return true;
    }

    try {
        const { data, error } = await resend.batch.send(
            emails.map(email => ({
                from: FROM_EMAIL,
                to: [email.to],
                subject: email.subject,
                html: email.html,
            }))
        );

        if (error) {
            console.error('Batch email error:', error);
            return false;
        }

        console.log(`📧 Batch sent: ${data.length} emails`);
        return true;
    } catch (err) {
        console.error('Batch email failed:', err.message);
        return false;
    }
}

/**
 * Generate parent weekly report HTML template
 */
export function generateParentReportTemplate(studentName, stats, insights) {
    return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #a78bfa; font-size: 24px; margin: 0;">🧠 AI NEET Coach</h1>
            <p style="color: #64748b; font-size: 14px;">Weekly Progress Report</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #c4b5fd; margin: 0 0 16px 0; font-size: 20px;">📊 ${studentName}'s Progress</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">Tests Taken</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-weight: 600; color: #e2e8f0;">${stats.testsTaken}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">Average Accuracy</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-weight: 600; color: ${stats.accuracy >= 70 ? '#4ade80' : stats.accuracy >= 40 ? '#fbbf24' : '#f87171'};">${stats.accuracy}%</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">Hours Studied</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-weight: 600; color: #e2e8f0;">${stats.hoursStudied} hrs</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; color: #94a3b8;">Current Streak</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #a78bfa;">🔥 ${stats.streak || 0} days</td>
                </tr>
            </table>
        </div>

        <div style="background: rgba(30, 27, 75, 0.5); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(167, 139, 250, 0.2);">
            <h3 style="color: #c4b5fd; margin: 0 0 12px 0;">💡 AI Insights</h3>
            <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
                ${insights.map(i => `<li style="margin-bottom: 8px;">${i}</li>`).join('')}
            </ul>
        </div>

        ${stats.focusArea ? `
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 0; color: white; font-weight: 500;">📌 Suggested Focus Area: <strong>${stats.focusArea}</strong></p>
        </div>
        ` : ''}

        <div style="text-align: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 12px; color: #475569; margin: 0;">AI NEET Coach — Helping your child ace NEET 2026</p>
        </div>
    </div>
    `;
}
