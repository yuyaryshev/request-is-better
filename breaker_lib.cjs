/* USAGES CHEATSHEET

// ================================================
// Break after some point

// When this point passed then breaker is enabled:
// @ts-ignore
BREAKER.enable();

// The is where breakpoint will be fired
// @ts-ignore
BREAKER.enabled();

// ================================================
// Break on same value

// @ts-ignore
BREAKER.onSame(VALUE_HERE);
// ================================================
// Break on saved value

// @ts-ignore
BREAKER.on(VALUE_HERE);
// ================================================
// Save the value

// @ts-ignore
BREAKER.save(VALUE_HERE);
// ================================================
// Log to console (just to separate this debug logs from other ones)

// @ts-ignore
BREAKER.log();
// ================================================

*/

/*
Идеи:
TO DO Делать вот так:
import {BREAKER_Lib} from "../../breaker_lib";
const BREAKER = BREAKER_Lib(__filename);

Это позволит внутри BREAKER'а делать функции, которые смотрят на файл
TO DO при этом нужно сохранить глобальность самого BREAKER'а

*/
const fs = require('fs');

function getTrace(n = 0) {
    return (new Error("BREAKER_STACK").stack + "")
        .split("\n")
        .splice(n + 3)
        .join("\n");
}

function printCompareStack() {
    console.log(`\n\n\nPrev stack trace START\n`);
    console.log(pthis.prevStack);
    console.log(`\nPrev stack trace END. This stack trace START\n`);
    console.log(getTrace(1));
    console.log(`\nThis stack trace END\n`);
}

function bufferToString(v) {
    return new Uint8Array(v.slice()).join(" ");
}

let breaker_map = {
    "": function createBreaker(instance = "") {
        if (!breaker_map[instance]) breaker_map[instance] = {};
        let pthis = Object.assign(breaker_map[instance], {
            BREAKER: "BREAKER",
            BREAKER_ENABLED: false,
            prevValue: undefined,
            prevStack: undefined,
            save: function BREAKER_save(v) {
                if (pthis.prevValue === undefined) {
                    pthis.enable();
                    pthis.prevValue = v;
                    pthis.prevStack = getTrace();
                }
            },
            on: function BREAKER_on(v) {
                const newValue = JSON.stringify(v);
                if (pthis.prevValue === newValue) {
                    printCompareStack();
                    debugger;
                }
            },
            onSame: function BREAKER_onSame(v) {
                const newValue = JSON.stringify(v);
                if (pthis.prevValue === undefined) {
                    pthis.enable();
                    pthis.prevValue = newValue;
                    pthis.prevStack = getTrace();
                } else if (pthis.prevValue === newValue) {
                    printCompareStack();
                    debugger;
                }
            },
            log: function BREAKER_log(...args) {
                console.log(...args);
            },
            enable: function BREAKER_enable(...args) {
                pthis.BREAKER_ENABLED = true;
            },
            enabled: function BREAKER_enabled(...args) {
                if (pthis.BREAKER_ENABLED) debugger;
            },
            enabledOnce: function BREAKER_enabledOnce(...args) {
                if (pthis.BREAKER_ENABLED) {
                    debugger;
                    pthis.disable();
                }
            },
            disable: function BREAKER_disable(...args) {
                pthis.BREAKER_ENABLED = false;
            },
        });
    },
};

const createBreaker = breaker_map[""];

global.BREAKER = Object.assign(createBreaker, createBreaker());
global.BREAKER.bufferToFile = global.bufferToFile = function bufferToFile(filename, buffer) {
    fs.writeFileSync(filename, buffer, 'binary');
}

//===== TEMP_DEBUG_CODE ================================================================================================
// const BufferList = require('bl');
let dbgBufferLists = {};

let writtenOnce = false;
global.BREAKER.buffer_dump = function buffer_dump(callerFilename, chunk, mode, offset) {
    return;
    const maxCheckLength = 200000;

    if(!mode)
        mode = "empty";

    if(!dbgBufferLists[mode]) dbgBufferLists[mode] = Buffer.alloc(0);

    if(dbgBufferLists[mode].length > (mode === "source"? 2: 1)* maxCheckLength)
        return;


    if(offset === undefined)
        dbgBufferLists[mode] = Buffer.concat([dbgBufferLists[mode], chunk]);
    else {
        offset = Number(offset);
        dbgBufferLists[mode] = Buffer.concat([dbgBufferLists[mode].slice(0,offset), chunk, dbgBufferLists[mode].slice(offset+chunk.length)]);
    }

    if(mode !== "source" && dbgBufferLists["source"]) {
        const myBuf = dbgBufferLists[mode];
        const sourceBuf = dbgBufferLists["source"].slice(0, myBuf.length);

        if(Buffer.compare(myBuf, sourceBuf) !== 0) {
            const n = myBuf.length;
            for(let i=0; i<n; i++)
                if(myBuf[i] !== sourceBuf[i]) {
                    if(!writtenOnce) {
                        writtenOnce = true;
                        BREAKER.bufferToFile(`d:\\temp\\sourceBuf.txt`, dbgBufferLists["source"]);
                        BREAKER.bufferToFile(`d:\\temp\\myByf.txt`, myBuf);
                    }
                    debugger;
                }
        }
    }

    return;
        let isFirstWriter = process.argv.join(" ").includes("mocha");
        const fn = "d:\\BREAKER_buffer_dump.txt";

        debugger;
        return;

        if (!pthis.dumped) {
            if (!pthis.bl) pthis.bl = new BufferList();
            pthis.bl.append(chunk);

            const current = bufferToString(pthis.bl);
            if (isFirstWriter) {
                if (pthis.bl.length < 100000)
                    require("fs").writeFileSync(fn, current, "utf-8");
            } else {
                const etalon = require("fs").readFileSync(fn, "utf-8");
                if (!etalon.startsWith(current)) {
                    console.log(`BREAKER_buffer_dump ${process.argv.join(" ")} ${callerHint}`);
                    console.log(`pthis \n${current}\n\n`);
                    for (let i = 0; i < current.length; i++) if (etalon[i] !== current[i]) debugger;
                    debugger;
                }
            }

            // if(pthis.bl.length > 70000) {
            //     console.log(`BREAKER_buffer_dump ${process.argv.join(' ')} ${callerHint}`);
            //     console.log(`BREAKER_buffer_dump \n${(new Uint8Array(pthis.bl.slice(65400, 65700)).join(" "))}\n\n`);
            //     pthis.dumped = true;
            // }
        }
    };
//======================================================================================================================
