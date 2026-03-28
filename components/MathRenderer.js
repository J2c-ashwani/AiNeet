'use client';

import 'katex/dist/katex.min.css';
import katex from 'katex';

/**
 * MathRenderer - Renders text containing LaTeX expressions.
 * Supports inline ($...$) and display ($$...$$) math.
 * Falls back to plain text for non-LaTeX content.
 */
export default function MathRenderer({ children }) {
    if (!children) return null;
    const text = typeof children === 'string' ? children : String(children);

    // Split on display math ($$...$$) and inline math ($...$)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    const parts = text.split(regex);

    return (
        <span className="math-wrapper">
            {parts.map((part, i) => {
                // Display math: $$...$$
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    const latex = part.slice(2, -2);
                    try {
                        const html = katex.renderToString(latex, {
                            displayMode: true,
                            throwOnError: false,
                            strict: false,
                        });
                        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch {
                        return <span key={i}>{part}</span>;
                    }
                }

                // Inline math: $...$
                if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                    const latex = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(latex, {
                            displayMode: false,
                            throwOnError: false,
                            strict: false,
                        });
                        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch {
                        return <span key={i}>{part}</span>;
                    }
                }

                // Plain text
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
}
