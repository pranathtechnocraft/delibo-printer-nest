import { Controller, Get } from '@nestjs/common';
import { ServerIDService } from './server-id.service';

@Controller('system')
export class ServerIDController {
  constructor(private readonly ServerID: ServerIDService) {}

  @Get('server-id')
  getServerId(): object {
    return { serverId: this.ServerID.getUUID() };
  }
}
