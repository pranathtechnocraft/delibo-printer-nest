export namespace InvoiceNamespace {
  export interface invoiceData {
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
  }
  export interface generateQRCode {
    shopName: string;
    sellingLocationId: string;
    category: string;
    orderNo: string;
    account_id: string;
  }
}
