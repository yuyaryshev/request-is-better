let fs = require("fs");
let f = JSON.parse(fs.readFileSync("package.json", "utf-8"));

let dd = Object.keys(f.dependencies);

let s =
    "\nDump dependencies\n" +
    dd.join(" ") +
    "\n\n\nnpm commands-1\nnpm i " +
    dd.join(" && npm i ") +
    "\n\n\nnpm i commands-2\nnpm i " +
    dd.join("\nnpm i ") +
    "\n\n";
fs.writeFileSync("dump_packages.txt", s, "utf-8");
