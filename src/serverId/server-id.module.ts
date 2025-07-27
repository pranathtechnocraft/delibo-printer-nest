import { Module } from '@nestjs/common';
import { ServerIDService } from './server-id.service';
import { ServerIDController } from './server-id.controller';

@Module({
  providers: [ServerIDService],
  exports: [ServerIDService],
  controllers: [ServerIDController],
})
export class ServerIDModule {}
