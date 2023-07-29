const config = require("./babel.esm.config.cjs");
config.plugins.push("@babel/transform-modules-commonjs");
module.exports = config;
