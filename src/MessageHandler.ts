import { EventEmitter } from "events";
import { Webview, Disposable } from "vscode";
import { randomUUID } from "crypto";
import { logger } from "./Logger";
import { RequestTarget } from "./types";
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
    if (data.target !== this.origin) {
      // redirecting
      this.send(data);
    } else {
      if (data.requestId !== undefined && data.origin === this.origin)
        this.listeners[data.requestId](data);

      this.onExtensionMessage(data);
    }
  }

  request(data: MessageHandlerData<any>) {
    const requestId = randomUUID();

    this.send({
      ...data,
      origin: this.origin,
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
      print("need a target to send ");
      return;
    }
    const webview = this.webviews[data.target];
    if (webview === undefined) {
      print("unkown target to send : " + data.target);
      return;
    }
    webview.postMessage(data); // ??? await
  }
}
