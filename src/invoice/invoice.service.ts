import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as printer from 'pdf-to-printer';

@Injectable()
export class InvoiceService {
  private async generateQRCode(data: {
    shopName: string;
    sellingLocationId: string;
    category: string;
    orderNo: string;
    account_id: string;
  }): Promise<string> {
    const qrContent = `orderId: ${data.orderNo}/sellingLocationId: ${data?.sellingLocationId}/category:${data?.category || 'NA'}/sellerAccId:${data?.account_id}`;
    const qrCodeDataUrl: string = await QRCode.toDataURL(qrContent, {
      width: 100,
      margin: 1,
    });

    return qrCodeDataUrl;
  }

  private async generateInvoice(
    order: {
      shopName: string;
      gstin: string;
      DeliboAddress: string;
      fssai: number;
      branch: string;
      type: string;
      orderNo: string;
      createdAt: string;
      items: {
        prdtName: string;
        qnty: number;
        price: number;
        // add any more item-specific fields if needed
      }[];
      totalQuantity: number;
      subTotal: number;
      gstTotal: number;
      total: number;
      deliverType: string;
      sellingLocationId: string;
      category: string;
      account_id: string;
    },
    filePath: string,
  ): Promise<unknown> {
    console.log('ORDER :::::: ', order);
    console.log('filePath :::::: ', filePath);
    const doc = new PDFDocument({
      size: [220, 600],
      margin: 10,
    });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const centerText = (text: string, size = 10, font = 'Courier') => {
      doc.font(font).fontSize(size).text(text, { align: 'center' });
    };
    const line = () => centerText('--------------------------------');
    const currency = (val: number) => {
      if (isNaN(val)) return 'Rs 0.00';
      return `Rs ${val.toFixed(2)}`;
    };
    // Header
    centerText(order.shopName || 'Shop', 12, 'Courier-Bold');
    centerText(order.DeliboAddress || 'NA');
    centerText(`GSTIN: ${order.gstin || 'NA'}`);
    centerText(`FSSAI NO.: ${order.fssai || 'NA'}`);
    centerText(`BRANCH NO: ${order.branch || 'NA'}`);
    line();

    // Order Info
    doc.font('Courier-Bold').text(`Type: ${order.type || 'Pickup'}`);
    doc.text(`Order No: ${order.orderNo}`);
    doc.text(`DATE: ${new Date(order.createdAt).toLocaleString()}`);
    line();

    // Item Header
    doc.font('Courier-Bold').text('Item          Qty  Rate   Amt');
    line();

    // Items
    order.items.forEach((item) => {
      const name =
        item.prdtName.length > 13
          ? item.prdtName.slice(0, 13)
          : item.prdtName.padEnd(13, ' ');
      const qty = item.qnty.toString().padStart(3, ' ');
      const rate = item.price.toFixed(2).padStart(6, ' ');
      const amt = (item.qnty * item.price).toFixed(2).padStart(6, ' ');
      doc.font('Courier').text(`${name}${qty}${rate}${amt}`);
    });

    line();

    // Totals
    doc.font('Courier-Bold').text(`Total Qty: ${order.totalQuantity}`);
    doc.font('Courier').text(`Subtotal: ${currency(order.subTotal)}`);
    doc.text(`GST: ${currency(order.gstTotal)}`);
    doc.font('Courier-Bold').text(`Total: ${currency(order.total)}`);

    // QR Code
    if (['DELDIL', 'BDADD'].includes(order.deliverType)) {
      const qrImage = await this.generateQRCode(order);
      const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64');
      doc.image(qrBuffer, doc.page.width / 2 - 50, doc.y + 5, {
        width: 100,
        height: 100,
      });
      doc.moveDown();
    }
    doc.moveDown(1);
    centerText('Thank You!!', 10, 'Courier-Bold');

    doc.end();
    return await new Promise<void>((resolve, reject) => {
      console.log('Invoice genet=r');

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });
  }

  async printInvoice(order: {
    shopName: string;
    gstin: string;
    DeliboAddress: string;
    fssai: number;
    branch: string;
    type: string;
    orderNo: string;
    createdAt: string;
    items: {
      prdtName: string;
      qnty: number;
      price: number;
      // add any more item-specific fields if needed
    }[];
    totalQuantity: number;
    subTotal: number;
    gstTotal: number;
    total: number;
    deliverType: string;
    sellingLocationId: string;
    category: string;
    account_id: string;
  }): Promise<void> {
    const kotPath = path.join(__dirname, '../../kot_invoice.pdf');
    try {
      await this.generateInvoice(order, kotPath);
      console.log('PDF GENERATED');
    } catch (error) {
      console.log('Error', error);
    }
    await printer.print(kotPath);
  }
}
