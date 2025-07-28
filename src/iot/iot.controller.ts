import { Body, Controller, Post } from '@nestjs/common';
import { IOTService } from './iot.service';
@Controller('iot')
export class IOTController {
  constructor(private readonly iotService: IOTService) {}
  @Post('subscribe')
  subscribeToTopic(
    @Body() body: { username: string; password: string; topic: string },
  ) {
    console.log('Body : ', body);
    return this.iotService.connectToIoT(body);
  }

  @Post('disconnect')
  disconnectToIot(): string {
    return this.iotService.disconnectIOT();
  }
}
