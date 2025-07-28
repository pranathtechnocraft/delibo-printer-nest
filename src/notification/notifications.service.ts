import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { ServerIDService } from 'src/serverId/server-id.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly websocketGateway: WebsocketGateway,
    private readonly ServerID: ServerIDService,
  ) {}

  sendNewNotification(data: { message: string }) {
    console.log('sendNewNotification : ', data);

    this.websocketGateway.emitNotification('notification', {
      title: 'New Alert',
      message: data.message,
      serverId: this.ServerID.getUUID(),
    });
  }
}
