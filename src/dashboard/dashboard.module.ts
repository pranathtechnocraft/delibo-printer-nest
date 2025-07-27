import { Module } from '@nestjs/common';
import { DashBoardController } from './dashboard.controller';

@Module({
  controllers: [DashBoardController],
})
export class DashBoardModule {}
