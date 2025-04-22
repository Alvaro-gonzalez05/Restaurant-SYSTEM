declare module 'ws' {
  import { Server as HttpServer } from 'http';

  export class WebSocket {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;

    readyState: number;
    send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView, cb?: (err?: Error) => void): void;
    close(code?: number, reason?: string): void;
    on(event: 'message', listener: (data: WebSocket.Data) => void): this;
    on(event: 'close', listener: (code: number, reason: string) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'open', listener: () => void): this;
  }

  export class WebSocketServer {
    constructor(options: { port: number; server?: HttpServer });
    on(event: 'connection', listener: (socket: WebSocket) => void): this;
    clients: Set<WebSocket>;
  }

  export namespace WebSocket {
    type Data = string | Buffer | ArrayBuffer | Buffer[];
  }
}