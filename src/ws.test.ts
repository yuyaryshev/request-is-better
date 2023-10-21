import { expect } from "chai";
import { Server } from "ws";
import { extractRequestValue, messagingToRequestResponse, prepareResponseWrapped } from "./index.js";
import WebSocket from "ws";

describe("ws.test.ts", () => {
    it("client requests server", async () => {
        let server = new Server({ port: 8080 });
        let client: WebSocket | undefined;
        try {
            server.on("connection", async (ws) => {
                ws.on("message", (request) => {
                    const parsedRequest = JSON.parse(request as any);
                    const requestData = extractRequestValue(parsedRequest);
                    const responseData = { ...requestData, serverResponse: true };
                    const response = prepareResponseWrapped(parsedRequest, responseData);
                    ws.send(JSON.stringify(response));
                });
            });

            client = new WebSocket("ws://localhost:8080");
            const { request, onReceive } = messagingToRequestResponse({ send: (m: unknown) => client!.send(JSON.stringify(m)), uniqualizer: client });
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
            client.on("message", (request) => {
                const parsedRequest = JSON.parse(request as any);
                const requestData = extractRequestValue(parsedRequest);
                const responseData = { ...requestData, clientResponse: true };
                const response = prepareResponseWrapped(parsedRequest, responseData);
                client.send(JSON.stringify(response));
            });

            await clientConnectedPromise;

            const { request, onReceive } = messagingToRequestResponse({
                send: (m: unknown) => clientSessionOnServer!.send(JSON.stringify(m)),
                uniqualizer: clientSessionOnServer,
            });
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
