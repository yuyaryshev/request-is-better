//        ...require("json5").parse(require("fs").readFileSync("package.json", "utf-8"))?.prettier,

let inprint_main;
try {
	inprint_main = require("./lib/cjs/inprint/main.js").inprint
} catch(e) {
	inprint_main = ()=> undefined;
	console.warn(`CODE00000000 Couldn't open ./lib/cjs/inprint/main.js - if its not yet compiled - ignore this warning!`);
}

module.exports = {
    files: ["src/**/*.{ts,cts,mts,tsx,js,jsx,cjs,mjs}"],
    inprint: inprint_main,
    embeddedFeatures: "first",
    forceProcessTermination: true,
    prettierOpts: { filepath: __dirname, ...require("json5").parse(require("fs").readFileSync("package.json", "utf-8"))?.prettier, parser:"typescript"},
};
