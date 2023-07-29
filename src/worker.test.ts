import { expect } from "chai";
import { parentPort, Worker } from "node:worker_threads";
import { messagingToRequestResponse } from "./index.js";

const workerFile = __filename.split("worker.test").join("workerForTest");

describe("worker.test.ts", () => {
    it("host requests worker", async () => {
        const worker = new Worker(workerFile);

        const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => worker.postMessage(m) });
        worker.on("message", onReceive);

        await new Promise((resolve) => {
            worker.on("online", async () => {
                resolve(1);
            });
        });

        {
            const response = await request({ msg: "message1" });
            expect(response).to.eql({ msg: "message1" });
        }

        {
            const response = await request({ msg: "message2" });
            expect(response).to.eql({ msg: "message2" });
        }

        {
            const response = await request({ msg: "message3" });
            expect(response).to.eql({ msg: "message3" });
        }

        {
            const response = await request({ msg: "exit" });
            expect(response).to.eql({ msg: "exit" });
        }
    });

    it("worker requests host", () => {
        return new Promise((resolve) => {
            const worker = new Worker(workerFile, { workerData: "workerToHost" });

            worker.on("message", (message) => {
                // Just echo the message back
                worker.postMessage(message);
                if ((message as any)?.m?.msg === "done") {
                    setTimeout(() => {
                        resolve(1);
                    }, 0);
                }
            });

            worker.postMessage("start");
        });
    });
});
