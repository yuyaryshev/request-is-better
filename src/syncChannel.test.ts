import { expect } from "chai";
import { messagingToRequestResponse } from "./index.js";

describe("syncChannel.test.ts", () => {
    const syncChannelExample = {
        callbacks: [] as any[],
        send: function (msg: unknown) {
            const response = { ...(msg as any) };
            response.m.thisIsRespone = true;
            for (let callback of syncChannelExample.callbacks) callback(response);
        },
        on: function (eventType: "message", callback: (m: unknown) => void) {
            syncChannelExample.callbacks.push(callback);
        },
    };

    it("should handle sync communication", () => {
        const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => syncChannelExample.send(m) });
        syncChannelExample.on("message", onReceive);

        const responses = [request({ msg: "message1" }), request({ msg: "message2" }), request({ msg: "message3" })];

        expect(responses).to.eql([
            { msg: "message1", thisIsRespone: true },
            { msg: "message2", thisIsRespone: true },
            { msg: "message3", thisIsRespone: true },
        ]);
    });
});
