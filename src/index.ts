// PackageName: request-is-better
// Request is better than sending and receiving messages, isn't it?

import exp from "constants";

const request_is_better_symbol = Symbol("request_is_better_symbol");

export interface MessageToReqResInput {
    send: (m: unknown) => Promise<void> | void;

    ignoreUnknownResponses?: boolean;
    timeout?: number;
    noWrap?: boolean; // Don't wrap messages into another object, just inject __r field inside message
    uniqualizer?: object; // Assign instance of 'request-is-better' to this object and read it from here if it already exists to avoid common error #1
}

export type RequestFunc<TReq = unknown, TRes = unknown> = (m: TReq) => Promise<TRes> | TRes;

let nextRequestIsBetterStateId = 1; // Id for debug purposes

export function messagingToRequestResponse<TReq = unknown, TRes = unknown>(opts: MessageToReqResInput) {
    // Protection from multiple calls on one channel
    if ((opts.uniqualizer as any)?.[request_is_better_symbol]) {
        return (opts.uniqualizer as any)?.[request_is_better_symbol];
    }

    let lastRequestId = 0;
    const requests: { [key: number]: RequestContext } = {};
    (requests as any).requestIsBetterStateId = `${nextRequestIsBetterStateId++}-${Math.random() * 100000000}`; // Id for debug purposes
    function request(m: any): Promise<any> | any {
        lastRequestId = ++lastRequestId < Number.MAX_SAFE_INTEGER - 1 ? lastRequestId : 1;
        const requestId = lastRequestId;
        requests[requestId] = {};

        if (opts.noWrap) {
            (m as any).__r = requestId;
            (m as any).__rq = 1;
        }
        const vRaw: any = opts.send(opts.noWrap ? (m as any) : ({ __r: requestId, __rq: 1, m } as WrappedMessage));

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
        // Don't process messages without __r
        if (!(rm as any).__r) {
            return;
        }

        // Don't process requests, only process responses
        if ((rm as any).__rq) {
            return;
        }

        // Prevent processing message more than once
        if ((rm as any)[request_is_better_symbol]) {
            return;
        }
        (rm as any)[request_is_better_symbol] = true;
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
    const r = { request: request as RequestFunc<TReq, TRes>, onReceive: onReceive as (m: unknown) => void };
    if ((opts.uniqualizer as any)?.[request_is_better_symbol]) {
        (opts.uniqualizer as any)[request_is_better_symbol] = r;
    }
    return r;
}

export function extractRequestValue(request: any, noWrap?: boolean) {
    return noWrap ? request : request.m;
}

export function prepareResponseNoWrap(request: any, response: any, libFields?: "clone" | "delete") {
    if (!response) {
        response = { ...request };
    }
    response.__r = request.__r;
    delete response.__rq;
    return response;
}

export function prepareResponseWrapped(request: any, response: any) {
    return { __r: request.__r, m: response };
}

export function prepareResponse(request: any, response: any, noWrap?: boolean) {
    return noWrap ? prepareResponseNoWrap(request, response) : prepareResponseWrapped(request, response);
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
