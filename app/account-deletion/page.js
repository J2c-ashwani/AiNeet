import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
    title: 'Account Deletion',
    description: 'Request deletion of an AI NEET Coach account and associated personal data.',
    alternates: { canonical: '/account-deletion' },
};

export default function AccountDeletionPage() {
    return (
        <LegalDocument
            title="Account Deletion"
            summary="Delete an AI NEET Coach account from inside the app or request deletion without reinstalling the app."
            updated="June 13, 2026"
        >
            <section>
                <h2>Delete from the app</h2>
                <ol>
                    <li>Sign in to AI NEET Coach.</li>
                    <li>Open Profile.</li>
                    <li>Choose Delete Account and confirm the request.</li>
                </ol>
                <p>Deletion disables access immediately and schedules associated personal data for deletion or anonymization.</p>
            </section>

            <section>
                <h2>Request deletion without the app</h2>
                <p>Send an account-deletion request from the email address registered to the account. Include the words &quot;Account Deletion Request&quot; in the subject.</p>
                <p><a href="mailto:support@aineetcoach.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20AI%20NEET%20Coach%20account%20registered%20to%20this%20email%20address.">Email an account deletion request</a></p>
                <p>Support may ask for limited information to verify account ownership before completing the request. Requests are normally completed within 30 days after verification.</p>
            </section>

            <section>
                <h2>Subscriptions before deletion</h2>
                <p>If the account has an active Google Play subscription, cancel its renewal in Google Play before deleting the account. Web subscription renewal is canceled as part of the deletion flow. Account deletion does not create a refund and ends access immediately.</p>
            </section>

            <section>
                <h2>What is deleted or retained</h2>
                <p>Account identity, contact information, notification registrations, and directly associated personal data are deleted or anonymized. Limited transaction, fraud-prevention, security, audit, or legal records may be retained where required. De-identified academic analytics may be retained because they can no longer identify the student.</p>
            </section>

            <section>
                <h2>Need help?</h2>
                <p>Contact <a href="mailto:support@aineetcoach.com?subject=Account%20Deletion%20Help">support@aineetcoach.com</a>.</p>
            </section>
        </LegalDocument>
    );
}
