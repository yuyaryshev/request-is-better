import { parentPort, workerData, isMainThread } from "node:worker_threads";
import { extractRequestValue, messagingToRequestResponse, prepareResponseNoWrap, prepareResponseWrapped } from "./index.js";
import { expect } from "chai";

if (isMainThread) {
    throw new Error(`This module should be loaded into Worker thread only!`);
}

if (!parentPort) {
    throw new Error(`Worker thread should have parentPort`);
}

setTimeout(() => process.exit(), 500);

let alreadyStarted = false;
if (!(workerData === "workerToHost")) {
    parentPort.on("message", (request) => {
        const requestData = extractRequestValue(request, true);
        const responseData = { ...requestData, workerResponse: true };
        const response = prepareResponseNoWrap(request, responseData);

        // Just echo the message back
        parentPort!.postMessage(response);
        if (request.msg === "exit") {
            process.exit();
        }
    });
} else {
    parentPort.on("message", async (message) => {
        if (alreadyStarted) {
            return;
        }
        alreadyStarted = true;
        // const { request, onReceive } = messagingToRequestResponseEx({ send: (m: unknown) => parentPort!.postMessage(JSON.stringify(m)) });
        // parentPort!.on("message", (m: unknown) => onReceive(JSON.parse(m as string)));

        const { request, onReceive } = messagingToRequestResponse({
            send: (m: unknown) => parentPort!.postMessage(m),
            uniqualizer: parentPort!,
            noWrap: true,
        });
        parentPort!.on("message", onReceive);

        {
            const response0 = await request({ msg: "message1" });
            const { msg, workerHostResponse } = response0;
            expect({ msg, workerHostResponse }).to.eql({ msg: "message1", workerHostResponse: true });
        }

        {
            const { msg, workerHostResponse } = await request({ msg: "message2" });
            expect({ msg, workerHostResponse }).to.eql({ msg: "message2", workerHostResponse: true });
        }

        {
            const { msg, workerHostResponse } = await request({ msg: "message3" });
            expect({ msg, workerHostResponse }).to.eql({ msg: "message3", workerHostResponse: true });
        }

        {
            const { msg, workerHostResponse } = await request({ msg: "done" });
            expect({ msg, workerHostResponse }).to.eql({ msg: "done", workerHostResponse: true });
        }

        setTimeout(() => {
            process.exit();
        }, 100);
    });
}
