// eslint.config.js — ESLint Flat Config (CJS, no external deps)
// Compatible with ESLint v9/v10 in any Node environment.
// Bans raw browser APIs in product pages/components.

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    {
        // Applies to all product page and component source files
        files: ['app/**/*.js', 'app/**/*.jsx', 'components/**/*.js', 'components/**/*.jsx'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        rules: {
            // ── Ban raw navigator.share in pages/components ───
            'no-restricted-syntax': [
                'error',
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
                    // Ban raw emoji characters as JSX text (use Icon component instead)
                    selector: "JSXText[value=/[\\u{1F300}-\\u{1FFFF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u]",
                    message:
                        'Raw emoji in JSX is banned (Wave 7). Use <Icon name="..." /> from components/ui/Icon.js instead.',
                },
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
