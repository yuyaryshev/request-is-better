const { yconsole } = require(`./lib/cjs/index.js`);
if ((yconsole ? 1 : 0) === 2) yconsole.log("never called");
yconsole.log("1234");