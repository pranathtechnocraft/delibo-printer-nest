import { Controller, Post, HttpCode } from '@nestjs/common';
import { TestConnectionService } from './test.service';

@Controller('connection')
export class TestConnectionController {
  constructor(private testPrinter: TestConnectionService) {}
  @Post('testPrinter')
  @HttpCode(200)
  async getServerId(): Promise<object> {
    return await this.testPrinter.testPrinter();
  }
}
