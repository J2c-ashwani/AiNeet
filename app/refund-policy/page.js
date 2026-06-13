import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
    title: 'Refund Policy',
    description: 'AI NEET Coach subscription cancellation and refund policy.',
    alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
    return (
        <LegalDocument
            title="Refund Policy"
            summary="How subscription cancellations, refunds, duplicate charges, and chargebacks are handled."
            updated="June 13, 2026"
        >
            <section>
                <h2>Normal cancellation</h2>
                <p>AI NEET Coach subscriptions are non-refundable once a billing period has started. If a student cancels a subscription, no further charges will be made from the next billing cycle, and paid access continues until the end of the current billing period.</p>
            </section>

            <section>
                <h2>Google Play subscriptions</h2>
                <p>Google Play subscriptions must be canceled from Google Play subscription settings. Google Play controls payment processing and any refund decision for purchases made through Google Play.</p>
            </section>

            <section>
                <h2>Exceptional payment issues</h2>
                <p>Suspected duplicate charges, fraud, unauthorized payments, or bank chargebacks require a support review. Access may be suspended during a chargeback or fraud investigation. Contact <a href="mailto:support@aineetcoach.com?subject=Billing%20Support">support@aineetcoach.com</a> with the account email and transaction reference.</p>
            </section>

            <section>
                <h2>Account deletion</h2>
                <p>Account deletion ends access immediately and does not create a refund. Cancel any active Google Play renewal before requesting deletion to prevent future billing.</p>
            </section>
        </LegalDocument>
    );
}
