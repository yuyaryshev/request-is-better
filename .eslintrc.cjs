const disableSonarjs = 1;
const importantOnly = 0;
const excludeDocs = 1;
const keepDebug = 1;

const nonImportantWarning = !importantOnly ? 2 : 0;
const nonImportantError = !importantOnly ? 1 : 0;

module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", ...(excludeDocs? []:["eslint-plugin-tsdoc", "jsdoc"]), "eslint-plugin-import", "react-hooks", !importantOnly && !disableSonarjs && "sonarjs"].filter(
        (item) => typeof item === "string",
    ),
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
        !importantOnly && !disableSonarjs && "plugin:sonarjs/recommended",
        "prettier",
    ].filter((item) => typeof item === "string"),
    rules: {
        "no-undef": 0,
        "no-prototype-builtins": 0,
        "no-useless-escape": 0,
        "no-empty": 0,
        "no-constant-condition": 0,
        "no-inner-declarations": 0,
        "no-case-declarations": 0,
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                js: "ignorePackages",
            },
        ],
        "import/no-default-export": 1,
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-inferrable-types": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/ban-types": 0,
        "jsdoc/require-jsdoc": excludeDocs ? 0 : nonImportantError,
        "jsdoc/require-description": excludeDocs ? 0 : nonImportantError,
        "prefer-const": 0,

        ...(excludeDocs?{}:{"tsdoc/syntax": 1}),
        // "require-jsdoc": ["error", {
        //     "require": {
        //         "FunctionDeclaration": true,
        //         "MethodDefinition": true,
        //         "ClassDeclaration": true,
        //         "ArrowFunctionExpression": false,
        //         "FunctionExpression": false
        //     }
        // }],
        ...(!importantOnly && !disableSonarjs
            ? {
                  "sonarjs/cognitive-complexity": 0,
                  "sonarjs/no-redundant-jump": 0,
                  "sonarjs/no-small-switch": 0,
                  "sonarjs/no-unused-collection": nonImportantError,
                  "sonarjs/no-collapsible-if": 0,
                  "sonarjs/prefer-immediate-return": 0,
                  "sonarjs/no-duplicate-string": 0,
                  "sonarjs/no-nested-switch": 0,
                  "sonarjs/no-nested-template-literals": 0,
                  "sonarjs/no-gratuitous-expressions": 0,
                  "sonarjs/no-one-iteration-loop": 0,
              }
            : {}),
        "no-unused-labels": nonImportantError,
        "no-debugger": keepDebug ? 0 : nonImportantError,
        "@typescript-eslint/no-non-null-asserted-optional-chain": 0,

        "@typescript-eslint/no-this-alias": 0,
        "no-ex-assign": 0,
        "@typescript-eslint/adjacent-overload-signatures": 0,
    },
};
