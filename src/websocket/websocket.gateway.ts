import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/websocket/connect',
  transports: ['websocket'],
})
@Injectable()
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvents(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async handleIdentity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  emitNotification(event: string, payload: any) {
    this.server.emit(event, payload); // e.g. this.server.emit('notification', { message: 'Hello' })
  }
}
