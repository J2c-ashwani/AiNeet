// eslint.config.js — ESLint Flat Config (ESLint v9+)
// Replaces .eslintrc-mobile-gates.js
// Bans raw browser APIs in product code. All hardware access must go through
// lib/utils/, lib/hooks/ platform utility layer.

import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        // Apply to all product source files
        files: ['app/**/*.js', 'app/**/*.jsx', 'components/**/*.js', 'components/**/*.jsx'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        rules: {
            // ── Ban raw navigator.share ───────────────────────
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
            ],
        },
    },
    {
        // Apply lib/ files (excluding the safe utility layer)
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
            globals: { ...globals.browser, ...globals.node },
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
];
