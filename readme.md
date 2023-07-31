# request-is-better

**Request-is-better** is a TypeScript library which makes it easier to use **request-response** calls on any channel that implements a send-receive message interface.
Like the lib? Support it with a star! 

## Features

- Easy to use: just provide a way to send messages and receive messages and you can write requests
- Works with any messaging channel: As long as your messaging channel has a send function and a way to hook in a message receive callback, you can use this library
- Timeout support: Optionally set a timeout duration for each request
- Supports both async and sync channels. I.e. if your channel handles messages syncroniously that is when recieving a message it calls `send` immediatly than this library will also return the result immediatly. 

## Installation
```bash
npm i request-is-better
pnpm i request-is-better
yarn i request-is-better
```

# Usage
Assuming your channel implements the `send(MESSAGE)` and `on("message", CALLBACK)` interface:

This is useful if your messaging channel does not use the standard send and on function signatures:

## WebSocket example
```typescript
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
```

## For examples
See `*.test.ts` files in git repository `src` folder

# Options
- `send: (m: unknown) => Promise<void> | void`
A function that sends a message through your messaging system.

- `ignoreUnknownResponses?: boolean`
If set to true, the library will ignore responses that do not match a known request ID. Defaults to false.

- `timeout?: number`
If provided, each request will automatically be rejected after this duration (in milliseconds) if no response is received.

- `noWrap?: boolean`
If true, than message should always be an object. And in that object field `__r` will be used by `request-is-better` to store requestId, so this field name shouldn't be occupied by the caller.

# Contributing
Please submit an issue or pull request on our GitHub repository.
https://github.com/yuyaryshev/request-is-better

Like the lib? Support it with a star! 

# License
The Unlicense
