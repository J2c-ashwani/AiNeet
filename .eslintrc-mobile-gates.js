// .eslintrc-mobile-gates.js — Mobile Gate ESLint Rules
// Purpose: Ban raw browser APIs in product code. Force all hardware access
// through the platform utility layer (lib/utils/, lib/hooks/).

module.exports = {
    env: { browser: true, es2022: true },
    parser: '@babel/eslint-parser',
    parserOptions: { requireConfigFile: false, babelOptions: { presets: ['@babel/preset-react'] } },
    rules: {
        // ── Raw navigator APIs ────────────────────────────────
        'no-restricted-syntax': [
            'error',
            // Block raw navigator.share in pages and components
            {
                selector: "MemberExpression[object.name='navigator'][property.name='share']",
                message: 'Use usePlatformShare() hook instead of raw navigator.share. See lib/hooks/usePlatformShare.js'
            },
            {
                selector: "MemberExpression[object.object.name='navigator'][object.property.name='clipboard']",
                message: 'Use copyToClipboard() from lib/utils/clipboard.js instead of raw navigator.clipboard'
            },
        ],
        // ── Raw window.open ───────────────────────────────────
        'no-restricted-globals': [
            'error',
            { name: 'open', message: 'Use openWhatsAppShare() or the native bridge — not raw window.open' },
        ],
    },
    overrides: [
        {
            // Exempt the utility layer — these ARE the canonical implementations
            files: [
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
                'scripts/**',
            ],
            rules: {
                'no-restricted-syntax': 'off',
                'no-restricted-globals': 'off',
            }
        }
    ],
    ignorePatterns: ['node_modules/', '.next/', 'out/', 'public/'],
};
