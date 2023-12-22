import { vscode } from "../utils/vscode";
// import { MessageHandlerData } from "../../../src/MessageHandler"

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

    private listeners: { [requestId: string]: (data: MessageHandlerData<any>) => void } = {};

    constructor(
        public onWebviewMessage: (data: MessageHandlerData<any>) => void,
        private origin: string
    ) {
        window.addEventListener("message", (e) => {
            const data: MessageHandlerData<any> = e.data;
            // console.log("messageHandler", e.data, Object.keys(this.listeners), this.origin);

            if (data.requestId && this.listeners[data.requestId] && data.target === this.origin) {
                this.listeners[data.requestId](data);
                return;
            }
            this.onWebviewMessage(data);
        });
    }

    request(data: MessageHandlerData<any>): Promise<MessageHandlerData<any>> {
        const requestId = crypto.randomUUID();

        this.send({
            origin: this.origin,
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
        if (data.target === undefined) {
            console.log("MessageHandler : need a target to send ");
            return;
        }
        const newOrigin = data.origin || this.origin; // for redirects

        const clonedData = JSON.parse(JSON.stringify({ ...data, origin: newOrigin }));
        vscode.postMessage(clonedData); // ??? await
    }
}
