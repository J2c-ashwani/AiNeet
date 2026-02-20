
// Mock Email Service (Replace with SendGrid/Resend in production)

export async function sendEmail(to, subject, htmlContent) {
    if (!to || !subject || !htmlContent) {
        console.error('Email Service Error: Missing parameters');
        return false;
    }

    // In production:
    // await resend.emails.send({ ... })

    console.log(`
    📧 --- MOCK EMAIL SENT ---
    To: ${to}
    Subject: ${subject}
    Content Preview: ${htmlContent.substring(0, 100)}...
    --------------------------
    `);

    return true;
}

export function generateParentReportTemplate(studentName, stats, insights) {
    return `
    <div style="font-family: sans-serif; color: #333;">
        <h2>Weekly Progress Report: ${studentName}</h2>
        <p>Here is how your child performed this week on NEET Coach:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Tests Taken</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${stats.testsTaken}</strong></td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Average Accuracy</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${stats.accuracy}%</strong></td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Hours Studied</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${stats.hoursStudied} hrs</strong></td>
            </tr>
        </table>

        <h3>💡 AI Insights</h3>
        <ul>
            ${insights.map(i => `<li>${i}</li>`).join('')}
        </ul>

        <p>Encourage them to focus on: <strong>${stats.focusArea}</strong> next week.</p>
        
        <br>
        <p style="font-size: 12px; color: #888;">AI NEET Coach Application</p>
    </div>
    `;
}
