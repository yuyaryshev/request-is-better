import { expect } from "chai";
import { parentPort, Worker } from "node:worker_threads";
import { extractRequestValue, messagingToRequestResponse, prepareResponseWrapped } from "./index.js";

const workerFile = __filename.split("worker.test").join("workerForTest");

describe("worker.test.ts", () => {
    it("host requests worker", async () => {
        const worker = new Worker(workerFile);

        const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => worker.postMessage(m), uniqualizer: worker });
        worker.on("message", onReceive);

        await new Promise((resolve) => {
            worker.on("online", async () => {
                resolve(1);
            });
        });

        {
            const response = await request({ msg: "message1" });
            expect(response).to.eql({ msg: "message1", workerResponse: true });
        }

        {
            const response = await request({ msg: "message2" });
            expect(response).to.eql({ msg: "message2", workerResponse: true });
        }

        {
            const response = await request({ msg: "message3" });
            expect(response).to.eql({ msg: "message3", workerResponse: true });
        }

        {
            const response = await request({ msg: "exit" });
            expect(response).to.eql({ msg: "exit", workerResponse: true });
        }
    });

    it("worker requests host", () => {
        return new Promise((resolve) => {
            const worker = new Worker(workerFile, { workerData: "workerToHost" });

            worker.on("message", (request) => {
                const requestData = extractRequestValue(request);
                const responseData = { ...requestData, workerHostResponse: true };
                const response = prepareResponseWrapped(request, responseData);

                // Just echo the message back
                worker.postMessage(response);
                if ((request as any)?.m?.msg === "done") {
                    setTimeout(() => {
                        resolve(1);
                    }, 0);
                }
            });

            worker.postMessage("start");
        });
    });
});
