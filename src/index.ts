// PackageName: request-is-better
// Request is better than sending and receiving messages, isn't it?

export interface MessageToReqResInput {
    send: (m: unknown) => Promise<void> | void;

    ignoreUnknownResponses?: boolean;
    timeout?: number;
    noWrap?: boolean; // Don't wrap messages into another object, just inject __r field inside message
}

export type RequestFunc<TReq = unknown, TRes = unknown> = (m: TReq) => Promise<TRes> | TRes;

export function messagingToRequestResponse<TReq = unknown, TRes = unknown>(opts: MessageToReqResInput) {
    let lastRequestId = 0;
    const requests: { [key: number]: RequestContext } = {};
    function request(m: any): Promise<any> | any {
        lastRequestId = ++lastRequestId < Number.MAX_SAFE_INTEGER - 1 ? lastRequestId : 1;
        const requestId = lastRequestId;
        requests[requestId] = {};

        if (opts.noWrap) {
            (m as any).__r = requestId;
        }
        const vRaw: any = opts.send(opts.noWrap ? (m as any) : ({ __r: requestId, m } as WrappedMessage));

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
    function onReceive(rm: WrappedMessage) {
        const requestId = rm.__r;
        delete (rm as any).__r;
        const context = requests[requestId];
        if (context) {
            if (context.resolve) {
                context.resolve(opts.noWrap ? rm : rm.m);
                delete requests[requestId];
            } else {
                context.syncResult = opts.noWrap ? rm : rm.m;
                context.syncResolved = true;
            }
        } else {
            if (!opts.ignoreUnknownResponses) {
                console.trace(`CODE00000001 Unknown response. There is no request with id = ${requestId || "undefined"}`);
            }
        }
    }
    return { request: request as RequestFunc<TReq, TRes>, onReceive: onReceive as (m: unknown) => void };
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

interface WrappedMessage {
    __r: UnkRequestId;
    m: unknown;
}

interface MessageWithInjectedR {
    __r: UnkRequestId;
}
