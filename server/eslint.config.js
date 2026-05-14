import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
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
            "security/detect-object-injection": "warn",           // Prevent prototype pollution
            "security/detect-non-literal-regexp": "warn",         // Prevent ReDoS
            "security/detect-unsafe-regex": "error",              // Catch catastrophic backtracking
            "security/detect-buffer-noassert": "error",           // Buffer safety
            "security/detect-child-process": "warn",              // child_process usage
            "security/detect-disable-mustache-escape": "error",
            "security/detect-eval-with-expression": "error",      // No eval()
            "security/detect-new-buffer": "error",
            "security/detect-no-csrf-before-method-override": "error",
            "security/detect-non-literal-fs-filename": "warn",    // Dynamic file paths
            "security/detect-non-literal-require": "warn",        // Dynamic requires
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
