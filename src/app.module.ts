import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { IOTModule } from './iot/iot.module';
import { DashBoardModule } from './dashboard/dashboard.module';
import { ServerIDModule } from './serverId/server-id.module';
import { NotificationsModule } from './notification/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { TestConnectionModule } from './testConnections/test.module';

@Module({
  imports: [
    AuthModule,
    IOTModule,
    DashBoardModule,
    ServerIDModule,
    NotificationsModule,
    WebSocketModule,
    TestConnectionModule,
  ],
})
export class AppModule {}
