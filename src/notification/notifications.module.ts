import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WebSocketModule } from 'src/websocket/websocket.module';
import { ServerIDModule } from 'src/serverId/server-id.module';

@Module({
  imports: [WebSocketModule,ServerIDModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
