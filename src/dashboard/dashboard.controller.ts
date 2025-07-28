import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('dashboard')
export class DashBoardController {
  @Get()
  getIndex(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'public', 'dashboard.html');
    // const filePath = join(process.cwd(), 'public', 'dashboard.html');
    console.log('Sending file:', filePath);
    res.sendFile(filePath);
  }
}
