import { expect } from "chai";
import { parentPort, Worker } from "node:worker_threads";
import { extractRequestValue, messagingToRequestResponse, prepareResponseNoWrap, prepareResponseWrapped } from "./index.js";

const workerFile = __filename.split("workerNoWrap.test").join("workerForNoWrapTest");

describe("workerNoWrap.test.ts", () => {
    it("host requests worker", async () => {
        const worker = new Worker(workerFile);

        const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => worker.postMessage(m), uniqualizer: worker, noWrap: true });
        worker.on("message", onReceive);

        await new Promise((resolve) => {
            worker.on("online", async () => {
                resolve(1);
            });
        });

        {
            const { msg, workerResponse } = await request({ msg: "message1" });
            expect({ msg, workerResponse }).to.eql({ msg: "message1", workerResponse: true });
        }

        {
            const { msg, workerResponse } = await request({ msg: "message2" });
            expect({ msg, workerResponse }).to.eql({ msg: "message2", workerResponse: true });
        }

        {
            const { msg, workerResponse } = await request({ msg: "message3" });
            expect({ msg, workerResponse }).to.eql({ msg: "message3", workerResponse: true });
        }

        {
            const { msg, workerResponse } = await request({ msg: "exit" });
            expect({ msg, workerResponse }).to.eql({ msg: "exit", workerResponse: true });
        }
    });

    it("worker requests host", () => {
        return new Promise((resolve) => {
            const worker = new Worker(workerFile, { workerData: "workerToHost" });

            worker.on("message", (request) => {
                const requestData = extractRequestValue(request, true);
                const responseData = { ...requestData, workerHostResponse: true };
                const response = prepareResponseNoWrap(request, responseData);

                worker.postMessage(response);
                if (requestData?.msg === "done") {
                    setTimeout(() => {
                        resolve(1);
                    }, 0);
                }
            });

            worker.postMessage("start");
        });
    });
});
