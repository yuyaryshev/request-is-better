import { expect } from "chai";
import { extractRequestValue, messagingToRequestResponse, prepareResponseWrapped } from "./index.js";

describe("syncChannel.test.ts", () => {
    const syncChannelExample = {
        callbacks: [] as any[],
        send: function (request: unknown) {
            const requestData = extractRequestValue(request);
            const responseData = { ...requestData, thisIsResponse: true };
            const response = prepareResponseWrapped(request, responseData);
            for (let callback of syncChannelExample.callbacks) callback(response);
        },
        on: function (eventType: "message", callback: (m: unknown) => void) {
            syncChannelExample.callbacks.push(callback);
        },
    };

    it("should handle sync communication", () => {
        const { request, onReceive } = messagingToRequestResponse({
            send: (m: unknown) => syncChannelExample.send(m),
            uniqualizer: syncChannelExample,
        });
        syncChannelExample.on("message", onReceive);

        const responses = [request({ msg: "message1" }), request({ msg: "message2" }), request({ msg: "message3" })];

        expect(responses).to.eql([
            { msg: "message1", thisIsResponse: true },
            { msg: "message2", thisIsResponse: true },
            { msg: "message3", thisIsResponse: true },
        ]);
    });
});
