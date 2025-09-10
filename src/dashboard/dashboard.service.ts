import { Injectable } from '@nestjs/common';
import { IOTService } from 'src/iot/iot.service';
@Injectable()
export class DashboardService {
  constructor(private IotService: IOTService) {}
  getCustomerDetail(): object {
    return this.IotService.getCustomerAccountId();
  }
}
