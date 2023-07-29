// pm2 start ecosystem.config.js
const fs = require("fs");
const path = require("path");
const { stringify } = require("javascript-stringify");
const name = path.resolve(".").split(path.sep).pop();

module.exports = {
    apps: [
        {
            name,
            script: "./ts_out/src/start.js",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};

console.log(`pm2 - ecosystem.config.js loaded! name='${name}'\n`, stringify(module.exports, undefined, "    "));
