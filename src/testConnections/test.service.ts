import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as printer from 'pdf-to-printer';

@Injectable()
export class TestConnectionService {
  async testPrinter(): Promise<object> {
    const testPrinterPdf = path.join(__dirname, '../../public/test_bill.pdf');
    try {
      const printerResponse = await printer.print(testPrinterPdf);
      console.log('printerResponse : ', printerResponse);

      return { message: 'Sample paper printing', color: '#0d830d' };
    } catch (error) {
      console.log(error);
      return { message: 'Failed', color: '#830d0d' };
    }
  }
}
