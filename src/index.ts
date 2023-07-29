// PackageName: request-is-better
// Request is better than sending and receiving messages, isn't it?

export interface MessageToReqResInput {
    send: (m: unknown) => Promise<void> | void;

    ignoreUnknownResponses?: boolean;
    timeout?: number;
}

export function messagingToRequestResponse(opts: MessageToReqResInput) {
    let lastRequestId = 0;
    const requests: { [key: number]: RequestContext } = {};
    function request(m: unknown): Promise<unknown> | unknown {
        lastRequestId = ++lastRequestId < Number.MAX_SAFE_INTEGER - 1 ? lastRequestId : 1;
        const requestId = lastRequestId;
        requests[requestId] = {};

        const vRaw: any = opts.send({ r: requestId, m } as RawMessage);

        if (requests[requestId].syncResolved) {
            const r = requests[requestId].syncResult;
            delete requests[requestId];
            return r;
        } else
            return new Promise((resolve, reject) => {
                requests[requestId] = { resolve, reject };
                if (opts.timeout) {
                    requests[requestId].timerHandle = setTimeout(() => {
                        const err = new Error(`Request timed out`);
                        (err as any).code = "ETIMEDOUT";
                        reject(err);
                    }, opts.timeout);
                }
            });
    }
    function onReceive(rm: RawMessage) {
        const context = requests[rm.r];
        if (context) {
            if (context.resolve) {
                context.resolve(rm.m);
                delete requests[rm.r];
            } else {
                context.syncResult = rm.m;
                context.syncResolved = true;
            }
        } else {
            if (!opts.ignoreUnknownResponses) {
                console.trace(`CODE00000001 Unknown response. There is no request with id = ${rm.r || "undefined"}`);
            }
        }
    }
    return { request, onReceive: onReceive as (m: unknown) => void };
}

type UnkRequestId = number;
type ResolveFunc = (v: unknown) => void;
type RejectFunc = (error: unknown) => void;
interface RequestContext {
    syncResolved?: boolean;
    syncResult?: unknown;
    resolve?: ResolveFunc;
    reject?: RejectFunc;
    timerHandle?: any;
}
interface RawMessage {
    r: UnkRequestId;
    m: unknown;
}
