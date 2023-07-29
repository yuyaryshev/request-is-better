import { parentPort, workerData, isMainThread } from "node:worker_threads";
import { messagingToRequestResponse } from "./index.js";
import { expect } from "chai";

if (isMainThread) {
    throw new Error(`This module should be loaded into Worker thread only!`);
}

if (!parentPort) {
    throw new Error(`Worker thread should have parentPort`);
}

setTimeout(() => process.exit(), 500);

let alreadyStarted = false;
if (workerData === "workerToHost") {
    parentPort.on("message", async (message) => {
        if (alreadyStarted) {
            return;
        }
        alreadyStarted = true;
        // const { request, onReceive } = messagingToRequestResponseEx({ send: (m: unknown) => parentPort!.postMessage(JSON.stringify(m)) });
        // parentPort!.on("message", (m: unknown) => onReceive(JSON.parse(m as string)));

        const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => parentPort!.postMessage(m) });
        parentPort!.on("message", onReceive);

        {
            const response: any = await request({ msg: "message1" });
            expect(response).to.eql({ msg: "message1" });
        }

        {
            const response: any = await request({ msg: "message2" });
            expect(response).to.eql({ msg: "message2" });
        }

        {
            const response: any = await request({ msg: "message3" });
            expect(response).to.eql({ msg: "message3" });
        }

        {
            const response: any = await request({ msg: "done" });
            expect(response).to.eql({ msg: "done" });
        }

        setTimeout(() => {
            process.exit();
        }, 100);
    });
} else {
    parentPort.on("message", (message) => {
        // Just echo the message back
        parentPort!.postMessage(message);
        if (message.msg === "exit") {
            process.exit();
        }
    });
}
