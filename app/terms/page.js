import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
    title: 'Terms of Service',
    description: 'Terms governing use of AI NEET Coach.',
    alternates: { canonical: '/terms' },
};

export default function TermsPage() {
    return (
        <LegalDocument
            title="Terms of Service"
            summary="These terms govern access to and use of AI NEET Coach on the web and Android."
            updated="June 13, 2026"
        >
            <section>
                <h2>Using the service</h2>
                <p>AI NEET Coach provides educational preparation tools, including practice tests, analytics, AI-assisted explanations, study plans, OMR features, and community or competitive learning features. You must provide accurate account information and keep your login credentials secure.</p>
            </section>

            <section>
                <h2>Educational scope</h2>
                <p>AI NEET Coach supports preparation and does not guarantee admission, examination results, ranks, or scores. AI-generated content can contain errors. Students should verify important academic information against current official NCERT, NTA, and NEET materials and seek qualified faculty guidance where appropriate.</p>
            </section>

            <section>
                <h2>Student eligibility</h2>
                <p>Users under 18 must use the service with permission and involvement from a parent or legal guardian. The guardian is responsible for reviewing these terms and supervising purchases made by a minor.</p>
            </section>

            <section>
                <h2>Acceptable use</h2>
                <p>You may not misuse the service, attempt unauthorized access, automate abusive requests, manipulate leaderboards or assessments, share paid access, upload unlawful content, interfere with other users, reverse engineer protected systems, or use the service to violate academic integrity rules.</p>
            </section>

            <section>
                <h2>Subscriptions and payments</h2>
                <p>Paid plans provide the features shown at purchase. Prices, billing periods, and renewal terms are displayed before payment. Google Play purchases are managed through Google Play. Web purchases are processed through Cashfree. Cancellation stops future renewal but normally preserves paid access until the current billing period ends. See the <a href="/refund-policy">Refund Policy</a> for details.</p>
            </section>

            <section>
                <h2>Account deletion</h2>
                <p>You may request account deletion from Profile or through the public <a href="/account-deletion">Account Deletion</a> page. Deleting an account ends access immediately and is different from merely canceling subscription renewal. Active Google Play renewal must be canceled through Google Play before deletion so that future billing stops.</p>
            </section>

            <section>
                <h2>Content and intellectual property</h2>
                <p>AI NEET Coach software, branding, original content, and product design remain protected by applicable intellectual-property laws. Users retain rights in content they submit, while granting us the limited permission needed to process it and provide the requested service.</p>
            </section>

            <section>
                <h2>Availability and enforcement</h2>
                <p>We work to keep the service secure and available, but maintenance, provider outages, quota limits, or events outside our control may interrupt access. We may restrict or terminate accounts involved in abuse, fraud, security threats, or material violations of these terms.</p>
            </section>

            <section>
                <h2>Contact</h2>
                <p>Questions about these terms may be sent to <a href="mailto:support@aineetcoach.com?subject=Terms%20Question">support@aineetcoach.com</a>.</p>
            </section>
        </LegalDocument>
    );
}
