let fs = require("fs");
let tsconf = eval("(()=>(" + fs.readFileSync("tsconfig.json", "utf-8") + "))()");

let aliases = {};
for (let k in tsconf.compilerOptions.paths) {
    let v = tsconf.compilerOptions.paths[k];
    aliases[k] = `./${v[0]}`; // /index.mjs`;
}

let DEV_SETTINGS = {};
try {
    DEV_SETTINGS = require("./DEV_SETTINGS.cjs");
} catch (e) {
//    console.trace(`DEV_SETTINGS not loaded`, e.stack);
}
const { DEV_BYPASS_AUTH } = DEV_SETTINGS;

module.exports = {
    presets: ["@babel/preset-typescript","@babel/preset-react"],
    plugins: [
        [
            "inline-replace-variables",
            {
                DEV_BYPASS_AUTH: DEV_BYPASS_AUTH,
            },
        ],
        "@babel/transform-typescript",
        [
            "@babel/plugin-proposal-decorators",
            { legacy: true },
        ],
        "@babel/proposal-optional-chaining",
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        [
            "module-resolver",
            {
                root: ["./"],
                alias: aliases,
            },
        ],
        // DON'T ADD @babel/transform-modules-commonjs here! It's added in babel.cjs.config.cjs!
    ],
};
