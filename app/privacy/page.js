import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
    title: 'Privacy Policy',
    description: 'How AI NEET Coach collects, uses, protects, retains, and deletes user data.',
    alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicyPage() {
    return (
        <LegalDocument
            title="Privacy Policy"
            summary="This policy explains how AI NEET Coach handles information across its website and Android application."
            updated="June 13, 2026"
        >
            <section>
                <h2>Who we are</h2>
                <p>AI NEET Coach provides digital study, assessment, analytics, and AI-assisted learning tools for NEET preparation. Privacy questions may be sent to <a href="mailto:support@aineetcoach.com?subject=Privacy%20Question">support@aineetcoach.com</a>.</p>
            </section>

            <section>
                <h2>Information we collect</h2>
                <ul>
                    <li>Account and profile information, such as name, email address, authentication details, target year, study preferences, and optional parent contact information.</li>
                    <li>Learning activity, such as test answers, scores, mistakes, weak topics, study plans, doubt conversations, progress, XP, streaks, and leaderboard activity.</li>
                    <li>Content submitted for a requested feature, including OMR sheets, question images, and text entered into AI-assisted tools.</li>
                    <li>Subscription and transaction status. Payment credentials are processed by Google Play or Cashfree; AI NEET Coach does not store full card or bank credentials.</li>
                    <li>Device and operational information, such as device registration tokens, App Check signals, app version, diagnostics, crash data, security events, and performance telemetry.</li>
                    <li>Advertising identifiers and ad interactions where advertising is enabled in the Android app.</li>
                </ul>
            </section>

            <section>
                <h2>How we use information</h2>
                <p>We use information to authenticate users, provide requested learning features, generate and grade assessments, personalize study support, synchronize progress, manage subscriptions, deliver notifications, prevent abuse, improve reliability, provide support, and meet legal obligations.</p>
            </section>

            <section>
                <h2>AI processing and academic data</h2>
                <p>Questions, doubts, and submitted learning content may be processed by AI service providers to deliver requested explanations, retrieval, grading, or study assistance. AI output can be imperfect and should be treated as preparation support rather than an official medical or examination authority.</p>
            </section>

            <section>
                <h2>Service providers and sharing</h2>
                <p>We do not sell personal information. We share only the information needed for service delivery, security, and compliance with providers such as Supabase, Google Firebase, Google Gemini, Google Play, Google AdMob, Cashfree, Sentry, Upstash, and hosting or infrastructure providers. These providers process data under their own terms and applicable data-protection obligations.</p>
            </section>

            <section>
                <h2>Permissions</h2>
                <p>The Android app requests camera or image access only when a student chooses an OMR or image-based feature, notifications only for requested learning reminders and account events, and billing access for Google Play purchases. Permission can be denied or changed in Android settings, although the related feature may then be unavailable.</p>
            </section>

            <section>
                <h2>Security, retention, and deletion</h2>
                <p>We use HTTPS, access controls, application integrity checks, audit logging, and operational monitoring to protect information. We retain account and learning data while the account is active and only as long as reasonably needed afterward for support, security, fraud prevention, payment records, legal obligations, or anonymized academic analytics.</p>
                <p>Students can request deletion from Profile inside the app or use the public <a href="/account-deletion">Account Deletion</a> page. Account deletion removes or anonymizes associated personal data, subject to limited legally or operationally required retention.</p>
            </section>

            <section>
                <h2>Students under 18</h2>
                <p>Students under 18 should use AI NEET Coach with the involvement and permission of a parent or legal guardian. Parents or guardians may contact us to ask about, correct, or request deletion of a student&apos;s information.</p>
            </section>

            <section>
                <h2>Your choices</h2>
                <p>You may update profile information, manage notification and device permissions, cancel subscription renewal, or request account deletion. For privacy access or correction requests, contact <a href="mailto:support@aineetcoach.com?subject=Privacy%20Request">support@aineetcoach.com</a>.</p>
            </section>

            <section>
                <h2>Policy changes</h2>
                <p>We may update this policy when the product, providers, or legal requirements change. The current version and its effective date will remain publicly available on this page.</p>
            </section>
        </LegalDocument>
    );
}
