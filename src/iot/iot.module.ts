import { Module } from '@nestjs/common';
import { IOTController } from './iot.controller';
import { IOTService } from './iot.service';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { ServerIDModule } from 'src/serverId/server-id.module';
import { NotificationsModule } from 'src/notification/notifications.module';

@Module({
  controllers: [IOTController],
  providers: [IOTService],
  imports: [InvoiceModule, ServerIDModule, NotificationsModule],
  exports: [IOTService],
})
export class IOTModule {}
