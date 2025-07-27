import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { IOTModule } from './iot/iot.module';
import { DashBoardModule } from './dashboard/dashboard.module';
import { ServerIDModule } from './serverId/server-id.module';

@Module({
  imports: [AuthModule, IOTModule, DashBoardModule, ServerIDModule],
})
export class AppModule {}
