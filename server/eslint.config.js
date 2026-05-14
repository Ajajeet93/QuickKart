const js = require("@eslint/js");
const security = require("eslint-plugin-security");

module.exports = [
    js.configs.recommended,
    security.configs.recommended,
    {
        files: ["**/*.js"],
        ignores: ["node_modules/**", "dist/**", "scratch/**"],
        plugins: {
            security,
        },
        rules: {
            // ── Security Rules (eslint-plugin-security) ──────────────────
            "security/detect-object-injection": "warn",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-unsafe-regex": "error",
            "security/detect-buffer-noassert": "error",
            "security/detect-child-process": "warn",
            "security/detect-disable-mustache-escape": "error",
            "security/detect-eval-with-expression": "error",
            "security/detect-new-buffer": "error",
            "security/detect-no-csrf-before-method-override": "error",
            "security/detect-non-literal-fs-filename": "warn",
            "security/detect-non-literal-require": "warn",
            "security/detect-possible-timing-attacks": "warn",
            "security/detect-pseudoRandomBytes": "error",

            // ── Code Quality ──────────────────────────────────────────────
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-console": "off",
            "eqeqeq": "error",
            "no-eval": "error",
        },
    },
];
