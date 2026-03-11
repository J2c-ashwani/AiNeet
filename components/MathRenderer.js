'use client';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function MathRenderer({ children }) {
    if (!children) return null;

    // Ensure children is a string
    const text = typeof children === 'string' ? children : String(children);

    return (
        <span className="math-wrapper">
            <Latex>{text}</Latex>
        </span>
    );
}
