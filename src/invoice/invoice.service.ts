import { Injectable } from '@nestjs/common';
// import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as printer from 'pdf-to-printer';
import * as puppeteer from 'puppeteer';

function getChromiumPath(): string {
  const isPkg = process.pkg;
  if (isPkg) {
    // When running from pkg build
    const basePath = path.join(process.cwd(), 'puppeteer');

    // Find chromium folder dynamically (e.g., win64-1083080)
    const dirs = fs.readdirSync(basePath);
    const chromiumFolder = dirs.find((d) => d.startsWith('win64-'));

    if (!chromiumFolder) {
      throw new Error('Chromium binary not found in puppeteer folder');
    }

    return path.join(basePath, chromiumFolder, 'chrome.exe'); // Windows
  } else {
    // Dev mode
    return puppeteer.executablePath();
  }
}

import {
  InvoiceData,
  GenerateQRCode,
  CartItems,
  ArrangeBillAndKotResponse,
} from 'src/namespaces/invoiceNamespace';
@Injectable()
export class InvoiceService {
  private async generateQRCode(data: GenerateQRCode): Promise<string> {
    const qrContent = `orderId: ${data.orderNo}/sellingLocationId: ${data?.sellingLocationId}/category:${data?.category || 'NA'}/sellerAccId:${data?.account_id}`;
    const qrCodeDataUrl: string = await QRCode.toDataURL(qrContent, {
      width: 100,
      margin: 1,
    });

    return qrCodeDataUrl;
  }

  private currency(val: number): string {
    if (isNaN(val)) return 'Rs 0.00';
    return `Rs ${val.toFixed(2)}`;
  }

  private async generateKot(
    filePath: string,
    order: InvoiceData,
    kot: CartItems[],
  ): Promise<void> {
    const browser = await puppeteer.launch({
      executablePath: getChromiumPath(),
      headless: true,
    });
    const page = await browser.newPage();
    const date = new Date(order.createdAt).toLocaleString();

    const htmlContent = `
   <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: 80mm auto;
      margin: 5mm;
    }
    body {
      font-family: Courier, monospace;
      font-size: 12px;
      margin: 0;
      padding: 0;
    }
    .center {
      text-align: center;
    }
    .line {
      border-top: 1px dashed #000;
      margin: 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    td {
      padding: 2px 0;
      font-size: 12px;
    }
    .qty {
      text-align: right;
      width: 30px;
    }
  </style>
</head>
<body>
  <div >
    <b>Station: --</b>
  </div>
  <div class="line"></div>
  <b>Type:</b> Take Away <br>
  <b>Bill No:</b> -- <br>
  <b>Order No:</b> ${order.orderNo} <br>
  <b>User:</b> ${order.buyerName} <br>
  <b>Date:</b> ${date} <br>
  <b>KOT No:</b> -- <br>
  <div class="line"></div>
  
  <table>
    <tr>
      <td><b>Item</b></td>
      <td class="qty"><b>Qty</b></td>
    </tr>
                ${kot
                  .map((it) => {
                    return `
              <tr><td>${it.prdtName}</td><td class="qty">${it.qnty}</td></tr>
            `;
                  })
                  .join('')}
  </table>
  <div class="line"></div>
  <table class="summary">
    <tr>
      <td><b>Total Qty</b></td>
      <td class="qty"><b>${order.totalQuantity}</b></td>
    </tr>
  </table>
  <div class="line"></div>
  <div class="center">
    <b>Thank You!!</b>
  </div>
</body>
</html>

  `;
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filePath,
      width: '80mm', // for receipt printer size
      printBackground: true,
    });

    await browser.close();
    // const doc = new PDFDocument({
    //   size: [255, 600],
    //   margin: 7,
    // });
    // const stream = fs.createWriteStream(filePath);
    // doc.pipe(stream);

    // const centerText = (text: string, size = 10, font = 'Courier') => {
    //   doc.font(font).fontSize(size).text(text, { align: 'center' });
    // };
    // const line = () => centerText('----------------------------------------');
    // doc.font('Courier-Bold').text(`Station: --'}`);
    // line();
    // doc.font('Courier-Bold').text(`Type: ${order.type || 'Pickup'}`);
    // line();

    // //Order Detail
    // doc.font('Courier-Bold').text(`Bill No : --`);
    // doc.text(`Order No : ${order.orderNo}`);
    // doc.font('Courier-Bold').text(`User : ${order.buyerName}`);
    // doc.text(`DATE: ${new Date(order.createdAt).toLocaleString()}`);
    // doc.text(`Kot No: --`);
    // line();

    // // Item Header
    // doc.font('Courier-Bold').text('Item           Qty');
    // // Items
    // kot.forEach((item) => {
    //   const name = item.prdtName;
    //   const qty = item.qnty.toString().padStart(3, ' ');
    //   doc.font('Courier').text(`${name}  ${qty}`);
    // });
    // line();

    // doc.moveDown(1);
    // centerText('Thank You!!', 10, 'Courier-Bold');

    // doc.end();
    // return await new Promise<void>((resolve, reject) => {
    //   console.log('Kot Generating');

    //   stream.on('finish', () => resolve());
    //   stream.on('error', (err) => reject(err));
    // });
  }

  private async generateBill(
    order: InvoiceData,
    filePath: string,
  ): Promise<void> {
    const browser = await puppeteer.launch({
      executablePath: getChromiumPath(),
      headless: true,
    });
    const page = await browser.newPage();
    const date = new Date(order.createdAt).toLocaleString();
    let qrImage: string = '';
    if (['DELDIL', 'BDADD', 'DIRDIL'].includes(order.deliverType)) {
      qrImage = await this.generateQRCode(order);
    }
    console.log('qrImage : ', qrImage);

    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Courier, monospace; font-size: 12px; margin: 20px; }
          h2 { text-align: center; margin: 4px 0; }
          hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 4px; }
          th { text-align: left; border-bottom: 1px dashed #000; }
          td:nth-child(2), td:nth-child(3), td:nth-child(4) {
            text-align: right;
          }
          .footer { margin-top: 10px; text-align: center; font-size: 11px; }
          .shopInformation {text-align: center; margin: 2px 0;}
          .orderInformation { text-align: left; margin: 2px 0; }
          .summary { margin-top: 8px; width: 100%; font-size: 12px; }
          .summary td { padding: 3px 0; }
          .summary td:first-child { text-align: left; }
          .summary td:last-child { text-align: right; }
          .qr-container { width: 150px; height: 150px; margin: 10px auto; }
          .qr-image { width: 150px; height: 150px; }
        </style>
      </head>
      <body>
        <h2>${order.shopName}</h2>
        <p class="shopInformation">${order.DeliboAddress}</p>
        <p class="shopInformation">GSTIN: ${order.gstin}</p>
        <p class="shopInformation">FSSAI NO.: ${order.fssai}</p>
        <hr>
        <p class="orderInformation"><b>Type:</b> Take away</p>
        <p class="orderInformation"><b>Order No:</b> ${order.orderNo}</p>
        <p class="orderInformation"><b>Date:</b> ${date}</p>
        <hr>
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Item</th>
              <th style="width: 15%;text-align: right;">Qty</th>
              <th style="width: 20%;text-align: right;">Rate</th>
              <th style="width: 25%;text-align: right;">Amt</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map((it) => {
                const qty = it.qnty.toString().padStart(3, ' ');
                const rate = it.price.toFixed(2).padStart(6, ' ');
                const amt = (it.qnty * it.price).toFixed(2).padStart(6, ' ');

                return `
              <tr>
                <td>${it.prdtName}</td>
                <td>${qty}</td>
                <td>${rate}</td>
                <td>${amt}</td>
              </tr>
            `;
              })
              .join('')}
          </tbody>
        </table>
        <hr>
        <table class="summary">
          <tr><td><b>Total Qty:</b></td><td>${order.totalQuantity}</td></tr>
          <tr><td>Subtotal:</td><td>${this.currency(order.subTotal)}</td></tr>
          <tr><td>GST:</td><td>${this.currency(order.gstTotal)}</td></tr>
          <tr><td><b>Total:</b></td><td><b>${this.currency(order.total)}</b></td></tr>
        </table>
        ${['DELDIL', 'BDADD', 'DIRDIL'].includes(order.deliverType) ? `<div class="qr-container"><img class="qr-image" src="${qrImage}" alt="QR Code" /></div>` : ''}
        <div class="footer">
          Thank you!!
        </div>
      </body>
    </html>
  `;
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filePath,
      width: '80mm', // for receipt printer size
      printBackground: true,
    });

    await browser.close();

    // const doc = new PDFDocument({
    //   size: [255, 600],
    //   margin: 7,
    // });
    // const stream = fs.createWriteStream(filePath);
    // doc.pipe(stream);
    // const centerText = (text: string, size = 10, font = 'Courier') => {
    //   doc.font(font).fontSize(size).text(text, { align: 'center' });
    // };
    // const line = () => centerText('----------------------------------------');
    // // Header
    // centerText(order.shopName || 'Shop', 12, 'Courier-Bold');
    // centerText(order.DeliboAddress || 'NA');
    // centerText(`GSTIN: ${order.gstin || 'NA'}`);
    // centerText(`FSSAI NO.: ${order.fssai || 'NA'}`);
    // centerText(`BRANCH NO: ${order.branch || 'NA'}`);
    // line();
    // // Order Info
    // doc.font('Courier-Bold').text(`Type: ${order.type || 'Pickup'}`);
    // doc.text(`Order No: ${order.orderNo}`);
    // doc.text(`DATE: ${new Date(order.createdAt).toLocaleString()}`);
    // line();
    // // Item Header
    // doc.font('Courier-Bold').text('Item           Qty    Rate    Amt');
    // line();
    // // Items
    // order.items.forEach((item) => {
    //   const name = this.splitProductNameByLength(item.prdtName, 13);
    //   const qty = item.qnty.toString().padStart(3, ' ');
    //   const rate = item.price.toFixed(2).padStart(6, ' ');
    //   const amt = (item.qnty * item.price).toFixed(2).padStart(6, ' ');
    //   name.forEach((productName, index) => {
    //     if (index === 1) {
    //       doc.font('Courier').text(`${productName} ${qty}   ${rate}   ${amt}`);
    //     } else {
    //       doc.font('Courier').text(`${productName}`);
    //     }
    //   });
    //   doc.moveDown(1);
    // });
    // line();
    // // Totals
    // doc.font('Courier-Bold').text(`Total Qty:      ${order.totalQuantity}`);
    // doc.font('Courier').text(`Subtotal:   ${this.currency(order.subTotal)}`);
    // doc.text(`GST:   ${this.currency(order.gstTotal)}`);
    // doc.font('Courier-Bold').text(`Total: ${this.currency(order.total)}`);
    // // QR Code

    // doc.moveDown(1);
    // centerText('Thank You!!', 10, 'Courier-Bold');
    // doc.end();
    // return await new Promise<void>((resolve, reject) => {
    //   console.log('Bill Generating');
    //   stream.on('finish', () => resolve());
    //   stream.on('error', (err) => reject(err));
    // });
  }

  private arrangeBillAndKot(cartItems: InvoiceData): ArrangeBillAndKotResponse {
    const joinCategoryIds = cartItems.items.reduce(
      (acc: Record<string, CartItems[]>, item: CartItems) => {
        if (acc[item.tci]) {
          acc[item.tci].push(item);
        } else {
          acc[item.tci] = [item];
        }
        return acc;
      },
      {} as Record<string, CartItems[]>,
    );
    return { bill: cartItems, kot: joinCategoryIds };
  }

  async printInvoice(order: InvoiceData): Promise<void> {
    const billPath = path.join(
      __dirname,
      '../../public/billAndKot/bill/bill.pdf',
    );
    try {
      const getArrangedBillAndKot = this.arrangeBillAndKot(order);
      console.log('getArrangedBillAndKot : ', getArrangedBillAndKot);

      await this.generateBill(getArrangedBillAndKot.bill, billPath);
      console.log('BILL PDF GENERATED');
      await printer.print(billPath);

      for (const [tci, items] of Object.entries(getArrangedBillAndKot.kot)) {
        const kotPath = path.join(
          __dirname,
          `../../public/billAndKot/kot/kot_${tci}.pdf`,
        );
        console.log('Category:', tci);
        await this.generateKot(kotPath, getArrangedBillAndKot.bill, items);
        console.log('KOT PDF GENERATED');
        await printer.print(kotPath);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }
}
