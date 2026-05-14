const js = require("@eslint/js");
const security = require("eslint-plugin-security");

// Node.js CommonJS globals — required for ESLint flat config (no env: node shorthand)
const nodeGlobals = {
    require:          "readonly",
    module:           "writable",
    exports:          "writable",
    process:          "readonly",
    console:          "readonly",
    __dirname:        "readonly",
    __filename:       "readonly",
    setTimeout:       "readonly",
    setInterval:      "readonly",
    clearTimeout:     "readonly",
    clearInterval:    "readonly",
    Buffer:           "readonly",
    global:           "readonly",
    URL:              "readonly",
    URLSearchParams:  "readonly",
};

module.exports = [
    // Global ignores — applied before all other configs
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "scratch/**",
            "data/**",        // seed data files
            "coverage/**",
        ],
    },

    // Apply Node.js globals to ALL files
    {
        languageOptions: {
            globals:     nodeGlobals,
            ecmaVersion: 2022,
            sourceType:  "commonjs",
        },
    },

    js.configs.recommended,
    security.configs.recommended,

    {
        files: ["**/*.js"],
        plugins: { security },
        rules: {
            // ── Security ─────────────────────────────────────────────────
            "security/detect-object-injection":               "warn",
            "security/detect-non-literal-regexp":             "warn",
            "security/detect-unsafe-regex":                   "warn",
            "security/detect-buffer-noassert":                "error",
            "security/detect-child-process":                  "warn",
            "security/detect-disable-mustache-escape":        "error",
            "security/detect-eval-with-expression":           "error",
            "security/detect-new-buffer":                     "error",
            "security/detect-no-csrf-before-method-override": "error",
            "security/detect-non-literal-fs-filename":        "warn",
            "security/detect-non-literal-require":            "warn",
            "security/detect-possible-timing-attacks":        "warn",
            "security/detect-pseudoRandomBytes":              "error",

            // ── Code Quality ──────────────────────────────────────────────
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-console":     "off",
            "eqeqeq":         "error",
            "no-eval":        "error",
        },
    },
];
