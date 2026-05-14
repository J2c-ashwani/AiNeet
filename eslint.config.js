// eslint.config.js — ESLint Flat Config (CJS, no external deps)
// Compatible with ESLint v9/v10 in any Node environment.
// Bans raw browser APIs in product pages/components.

const jsxA11y = require('eslint-plugin-jsx-a11y');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    {
        // Applies to all product page and component source files
        files: ['app/**/*.js', 'app/**/*.jsx', 'src/**/*.js', 'src/**/*.jsx', 'components/**/*.js', 'components/**/*.jsx', 'context/**/*.js', 'context/**/*.jsx', 'providers/**/*.js', 'providers/**/*.jsx'],
        plugins: {
            'jsx-a11y': jsxA11y
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        rules: {
            // Include essential a11y rules directly to fail builds on violation
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-proptypes': 'error',
            'jsx-a11y/aria-unsupported-elements': 'error',
            'jsx-a11y/role-has-required-aria-props': 'error',
            'jsx-a11y/role-supports-aria-props': 'error',

            // ── Ban raw navigator.share in pages/components ───
            'no-restricted-syntax': [
                'warn', // MD Directive: Start as warning for UI gates to prevent breaking legacy codebase
                {
                    selector: "MemberExpression[object.name='navigator'][property.name='share']",
                    message:
                        'Use usePlatformShare() from lib/hooks/usePlatformShare.js instead of raw navigator.share.',
                },
                {
                    selector:
                        "MemberExpression[object.object.name='navigator'][object.property.name='clipboard']",
                    message:
                        'Use copyToClipboard() from lib/utils/clipboard.js instead of raw navigator.clipboard.',
                },
                // ── Wave 7 UI Quality Gates ───────────────────
                {
                    // Ban raw emoji characters as JSX text
                    selector: "JSXText[value=/[\\u{1F300}-\\u{1FFFF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u]",
                    message: 'Raw emoji in JSX is banned (Wave 7). Use <Icon name="..." /> instead.',
                },
                {
                    // Ban inline colors
                    selector: "JSXAttribute[name.name='style'] Property Literal[value=/^#|^rgb\\(|^rgba\\(|^hsl\\(/]",
                    message: 'Inline colors are banned. Use semantic CSS tokens (e.g., var(--text-primary)).',
                },
                {
                    // Ban backdrop-filter
                    selector: "JSXAttribute[name.name='style'] Property[key.name='backdropFilter']",
                    message: 'Inline backdrop-filter is banned. Use canonical UI components.',
                },
                {
                    // Ban random pixel values (e.g., '14px')
                    selector: "JSXAttribute[name.name='style'] Property Literal[value=/^[0-9]+px$/]",
                    message: 'Hardcoded pixel values are banned. Use CSS variables or primitives.',
                },
                {
                    // Ban raw border radius
                    selector: "JSXAttribute[name.name='style'] Property[key.name='borderRadius']",
                    message: 'Inline border-radius is banned. Use global radius tokens.',
                },
                {
                    // Ban raw z-index
                    selector: "JSXAttribute[name.name='style'] Property[key.name='zIndex']",
                    message: 'Inline z-index is banned. Use standardized z-layer scale classes.',
                },
                {
                    // Ban inline font sizes
                    selector: "JSXAttribute[name.name='style'] Property[key.name='fontSize']",
                    message: 'Inline font-size is banned. Use typography tokens.',
                },
                {
                    // Ban raw hex in tailwind classNames (e.g., text-[#7c4dff])
                    selector: "JSXAttribute[name.name='className'] Literal[value=/\\[#[0-9a-fA-F]{3,6}\\]/]",
                    message: 'Raw hex colors in Tailwind classNames are banned. Use token utilities.',
                },
                {
                    selector: "JSXOpeningElement[name.name='button']",
                    message: 'Raw <button> primitive is banned. Use <Button /> from @/components/ui.',
                },
                {
                    selector: "JSXOpeningElement[name.name='input']",
                    message: 'Raw <input> primitive is banned. Use <Input /> from @/components/ui.',
                },
                {
                    selector: "JSXOpeningElement[name.name='select']",
                    message: 'Raw <select> primitive is banned. Use <Select /> from @/components/ui.',
                },
                {
                    selector: "JSXOpeningElement[name.name='textarea']",
                    message: 'Raw <textarea> primitive is banned. Use <Textarea /> from @/components/ui.',
                },
                {
                    selector: "JSXOpeningElement[name.name='dialog']",
                    message: 'Raw <dialog> primitive is banned. Use <Modal /> from @/components/ui.',
                }
            ],
        },
    },
    {
        // Applies to lib files excluding the platform utility layer itself
        files: ['lib/**/*.js'],
        ignores: [
            'lib/utils/whatsapp.js',
            'lib/utils/clipboard.js',
            'lib/hooks/usePlatformShare.js',
            'lib/platform.js',
            'lib/telemetry/**',
            'lib/recovery/**',
            'lib/mobile/**',
            'lib/resilience/**',
            'lib/security/**',
            'lib/jobs/**',
            'lib/boot/**',
        ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: "MemberExpression[object.name='navigator'][property.name='share']",
                    message: 'Use usePlatformShare() instead of raw navigator.share.',
                },
            ],
        },
    },
    {
        // Global ignores
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'public/**',
            'mobile/**',
            'scripts/**',
        ],
    },
];
