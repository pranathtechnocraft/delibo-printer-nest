import { Module } from '@nestjs/common';
import { DashBoardController } from './dashboard.controller';
import { IOTModule } from 'src/iot/iot.module';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashBoardController],
  imports: [IOTModule],
  providers: [DashboardService],
})
export class DashBoardModule {}
