import { Module } from '@nestjs/common';
import { IOTController } from './iot.controller';
import { IOTService } from './iot.service';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { ServerIDModule } from 'src/serverId/server-id.module';
@Module({
  controllers: [IOTController],
  providers: [IOTService],
  imports: [InvoiceModule, ServerIDModule],
})
export class IOTModule {}
