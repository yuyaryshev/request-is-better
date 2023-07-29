import { expect } from "chai";
import WebSocket, { Server } from "ws";
// In your code use the following line instead of "./index.js";
// import { messagingToRequestResponse } from "request-is-better";
import { messagingToRequestResponse } from "./index.js";

describe("ws_for_readme.test.ts", () => {
    it("client requests server", async () => {
        let server = new Server({ port: 8080 });
        let client: WebSocket | undefined;
        try {
            // Stub ws echo server
            server.on("connection", async (ws) => {
                ws.on("message", (message) => ws.send(message));
            });

            // Ws client connected to the server
            client = new WebSocket("ws://localhost:8080");

            // Next two lines is how to use 'messagingToRequestResponse' from request is better
            const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => client!.send(JSON.stringify(m)) });
            client.on("message", (m: unknown) => onReceive(JSON.parse(m as string)));

            // We have to wait for client to connect to the server
            await new Promise((resolve) => {
                client!.on("open", async () => {
                    resolve(1);
                });
            });

            // And now we can use 'request'
            const response = await request({ msg: "message1" });

            expect(response).to.eql({ msg: "message1" });
        } finally {
            client?.close();
            server.close();
        }
    });
});
