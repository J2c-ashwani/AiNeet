import Link from 'next/link';
import styles from './LegalDocument.module.css';

const LEGAL_LINKS = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/account-deletion', label: 'Account Deletion' },
];

export default function LegalDocument({ title, summary, updated, children }) {
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/">AI NEET Coach</Link>
                    <span aria-hidden="true">/</span>
                    <span>{title}</span>
                </nav>

                <header className={styles.header}>
                    <p className={styles.eyebrow}>Legal and Trust</p>
                    <h1>{title}</h1>
                    <p className={styles.summary}>{summary}</p>
                    <p className={styles.updated}>Last updated: {updated}</p>
                </header>

                <article className={styles.document}>
                    {children}
                </article>

                <nav className={styles.legalNav} aria-label="Legal documents">
                    {LEGAL_LINKS.map(link => (
                        <Link key={link.href} href={link.href}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </main>
    );
}
