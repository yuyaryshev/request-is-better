import { expect } from "chai";
import { Server } from "ws";
import { messagingToRequestResponse } from "./index.js";
import WebSocket from "ws";

describe("ws.test.ts", () => {
    it("client requests server", async () => {
        let server = new Server({ port: 8080 });
        let client: WebSocket | undefined;
        try {
            server.on("connection", async (ws) => {
                ws.on("message", (message) => {
                    // Simulate server response
                    const r = JSON.parse(message as any);
                    r.m.serverResponse = true;
                    ws.send(JSON.stringify(r));
                });
            });

            client = new WebSocket("ws://localhost:8080");
            const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => client!.send(JSON.stringify(m)) });
            client.on("message", (m: unknown) => {
                return onReceive(JSON.parse(m as string));
            });

            await new Promise((resolve) => {
                client!.on("open", async () => {
                    resolve(1);
                });
            });

            {
                const response = await request({ msg: "message1" });
                expect(response).to.eql({ msg: "message1", serverResponse: true });
            }
            {
                const response = await request({ msg: "message2" });
                expect(response).to.eql({ msg: "message2", serverResponse: true });
            }
            {
                const response = await request({ msg: "message3" });
                expect(response).to.eql({ msg: "message3", serverResponse: true });
            }
        } finally {
            client?.close();
            server.close();
        }
    });

    it("server requests client", async () => {
        const server = new Server({ port: 8081 });
        let client: WebSocket | undefined;
        let clientSessionOnServer: WebSocket | undefined;
        try {
            const clientConnectedPromise = new Promise((resolve) => {
                server.on("connection", async (ws) => {
                    clientSessionOnServer = ws;
                    resolve(1);
                });
            });

            const client = new WebSocket("ws://localhost:8081");
            client.on("message", (message) => {
                const r = JSON.parse(message as any);
                r.m.clientResponse = true;
                client.send(JSON.stringify(r));
            });

            await clientConnectedPromise;

            const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => clientSessionOnServer!.send(JSON.stringify(m)) });
            clientSessionOnServer!.on("message", (m: unknown) => {
                return onReceive(JSON.parse(m as string));
            });

            {
                const response = await request({ msg: "message1" });
                expect(response).to.eql({ msg: "message1", clientResponse: true });
            }

            {
                const response = await request({ msg: "message2" });
                expect(response).to.eql({ msg: "message2", clientResponse: true });
            }

            {
                const response = await request({ msg: "message3" });
                expect(response).to.eql({ msg: "message3", clientResponse: true });
            }
        } finally {
            client?.close();
            server.close();
            clientSessionOnServer?.terminate();
        }
    });
});
