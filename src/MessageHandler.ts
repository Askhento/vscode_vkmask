import { EventEmitter } from "events";
import { Webview, Disposable } from "vscode";
import { randomUUID } from "crypto";
import { logger } from "./Logger";
import { RequestTarget, ViewIds } from "./types";
const print = (...args: any) => logger.log(__filename, ...args);

// export interface Event<T> {

// }

export interface MessageHandlerData<T> {
    requestId?: string;
    error?: any;
    target: string;
    origin?: string;
    command: string;
    payload?: T;
}

export class MessageHandler {
    // public webViewsMap : Record<string, Webview>  = {};
    public onExtensionMessage: (data: MessageHandlerData<any>) => void | undefined;
    public webviews: Record<string, Webview> = {};
    private listeners: { [requestId: string]: Function } = {};
    origin: string = RequestTarget.extension;

    constructor() {}

    bindViewMessageHandler(webview: Webview, id: string): Disposable {
        this.webviews[id] = webview;
        return webview.onDidReceiveMessage(this.onMessage, this);
    }

    async onMessage(data: MessageHandlerData<any>) {
        const { target, origin } = data;
        // todo : add a list of targets
        switch (target) {
            case RequestTarget.all:
                // redirect to all webviews
                Object.keys(this.webviews)
                    .filter((viewId) => viewId !== origin)
                    .forEach((viewId) => {
                        this.send({ ...data, target: viewId });
                    });
                // inform extension
                this.onExtensionMessage(data);
                break;

            case this.origin:
                // we have a response
                if (data.requestId !== undefined && data.origin === this.origin)
                    this.listeners[data.requestId](data);
                // inform extension
                else this.onExtensionMessage(data);
                break;

            default:
                // redirecting
                this.send(data);
                break;
        }
    }

    request(data: MessageHandlerData<any>) {
        const requestId = randomUUID();

        this.send({
            ...data,
            requestId,
        });

        return new Promise((resolve) => {
            this.listeners[requestId] = (data: MessageHandlerData<any>) => {
                // if (error) {
                // reject(error);
                // } else {
                // }
                resolve(data);

                if (this.listeners[requestId]) {
                    delete this.listeners[requestId];
                }
            };
        });
    }

    send(data: MessageHandlerData<any>) {
        const { target, origin } = data;
        if (target === undefined) {
            print("need a target to send ");
            return;
        }

        const newOrigin = origin || this.origin;
        if (target === RequestTarget.all) {
            Object.keys(this.webviews).forEach((viewId) => {
                const webview = this.webviews[viewId];
                if (webview === undefined) {
                    print("unkown target to send : " + target);
                    return;
                }
                webview.postMessage({ ...data, origin: newOrigin, target: viewId });
            });
            return;
        }

        const webview = this.webviews[target];
        if (webview === undefined) {
            print("unkown target to send : " + target);
            return;
        }
        webview.postMessage({ ...data, origin: newOrigin }); // ??? await
    }
}
