export interface InvoiceData {
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
  buyerName: string;
}

export interface CartItems {
  alwaysInventory: boolean;
  gstAmount: number;
  includingTAX: boolean;
  marketPrice: number;
  prdtId: string;
  prdtImg: string;
  prdtName: string;
  price: number;
  qnty: number;
  soi: string;
  sts: string | null | undefined;
  tax: {
    label: string;
    value: string;
  };
  tci: string;
  tcn: string;
  unit: {
    label: string;
    value: string;
  };
  vrntId: string;
  vrntIndexNo: number;
}

export interface ArrangeBillAndKotResponse {
  bill: InvoiceData;
  kot: Record<string, CartItems[]>;
}

export interface GenerateQRCode {
  shopName: string;
  sellingLocationId: string;
  category: string;
  orderNo: string;
  account_id: string;
}
