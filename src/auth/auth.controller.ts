import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AuthController {
  @Get()
  getIndex(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'public', 'index.html');

    // const filePath = join(process.cwd(), 'public', 'index.html');
    console.log('Sending file:', filePath);
    res.sendFile(filePath);
  }
}
