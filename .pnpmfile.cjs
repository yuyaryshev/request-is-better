// Put this file into your projects hastyData.
// This will enable yarn's you package.json/restrictions for common use cases (not all!) cases.
//
// Author: Yuri Yaryshev, Moscow, Russia
//
// Unlicense
//
// This is free and unencumbered software released into the dist domain.
// Any use of this file is hereby granted.
// No warranty or obligations of any kind are provided by author.
// http://unlicense.org/

let path = require("path");
let fs = require("fs");

let packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
let resolutions = packageJson.resolutions;
if (packageJson.plainDependencies)
    resolutions = Object.assign(packageJson.dependencies, packageJson.devDependencies, packageJson.resolutions);

if (packageJson.noResolution) for (let nr of packageJson.noResolution) delete resolutions[nr];

if (resolutions && packageJson.resolutionStr)
    for (let k in resolutions) if (!packageJson.resolutionStr.includes(k)) delete resolutions[k];

let resolutionsArray = [];
for (let k in resolutions) {
    const r = resolutions[k];
    resolutionsArray.push(`    ${k} ${r}`);
}
console.log(`Using pnpmfile resolutions\n\t`, resolutionsArray.join("\n"));

try {
    const { ymultirepoRemap } = require("../local_packages_list");
    module.exports = {
        hooks: {
            readPackage,
        },
    };

    function readPackage(p, context) {
        //console.log(`in readPackage\n${JSON.stringify(p, undefined, '    ')}\n\n\n`);
        //console.log(`context\n${JSON.stringify(context, undefined, '    ')}\n\n\n`);
        ymultirepoRemap(p, context);
        //    if (p.dependencies)
        //        for (let k in p.dependencies) {
        //            const override = resolutions[k];
        //            //console.log(`        MAYBE overriden dependency ${k} ${p.dependencies[k]} -> ${override}, ${override && p.dependencies[k] !== override}`);
        //            if (override && p.dependencies[k] !== override) {
        //                console.log(`        overriden dependency ${k} ${p.dependencies[k]} -> ${override}`);
        //                p.dependencies[k] = override;
        //            }
        //        }
        return p;
    }
} catch (e) {
    if (e.code === "MODULE_NOT_FOUND" && e.message.includes("local_packages_list")) {
        console.warn(`.pnpmfile.cjs couldn't open local_packages_list - no hooks started!`);
    } else console.error(e);
    module.exports = {};
}
