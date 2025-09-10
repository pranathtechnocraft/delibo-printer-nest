import { Module } from '@nestjs/common';
import { TestConnectionController } from './test.controller';
import { TestConnectionService } from './test.service';

@Module({
  providers: [TestConnectionService],
  controllers: [TestConnectionController],
})
export class TestConnectionModule {}
