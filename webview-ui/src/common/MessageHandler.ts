
import { vscode } from "../utils/vscode";
// import { MessageHandlerData } from "../../../src/MessageHandler" 

export interface MessageHandlerData<T> {
    requestId?: string;
    error?: any;
    target : string,
    origin? : string,
    payload?: T;
}

export class MessageHandler
{
    // public webViewsMap : Record<string, Webview>  = {};
    
    private listeners: { [requestId: string]: (data : MessageHandlerData<any>) => void } = {};

    constructor( public onWebviewMessage : (data : MessageHandlerData<any>) => void, private origin : string )
    {
        window.addEventListener("message", (e) => {
            const data : MessageHandlerData<any> = e.data;
            if (data.requestId && this.listeners[data.requestId] && data.target === this.origin) 
            {
                this.listeners[data.requestId](data);
                return;
            }
            this.onWebviewMessage(data);
        })
    }

    request(data : MessageHandlerData<any>) : Promise<MessageHandlerData<any>> {
        const requestId = crypto.randomUUID();

        this.send({
            ...data,
            origin : this.origin,
            requestId
        });

        return new Promise((resolve) => {
            this.listeners[requestId] = (data : MessageHandlerData<any>) => {
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

    send(data : MessageHandlerData<any>) {
        if (data.target === undefined) {
            print("need a target to send ");
            return;
        }
        vscode.postMessage(data) // ??? await 
    }

}


