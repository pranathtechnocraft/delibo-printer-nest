import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ServerIDService implements OnModuleInit {
  private readonly filePath = path.resolve(__dirname, '..', 'uuid.txt');
  private uuid: string;

  onModuleInit() {
    this.uuid = this.loadOrCreateUUID();
  }

  private loadOrCreateUUID(): string {
    console.log('this.filePath : ', this.filePath);
    console.log(
      'fs.existsSync(this.filePath) : ',
      fs.existsSync(this.filePath),
    );

    if (fs.existsSync(this.filePath)) {
      return fs.readFileSync(this.filePath, 'utf-8').trim();
    } else {
      const newUuid = randomUUID();
      console.log('new uuid : ', newUuid);
      fs.writeFileSync(this.filePath, newUuid, 'utf-8');
      return newUuid;
    }
  }

  getUUID(): string {
    return this.uuid;
  }
}
