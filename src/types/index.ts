export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'staff';
  email: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  organization: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  unitType: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ChallanItem {
  id: string;
  itemName: string;
  details: string;
  size: string;
  deliveryQty: number;
  balanceQty: number;
  unit: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: LineItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid';
  notes: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: LineItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string;
  notes: string;
  createdAt: string;
}

export interface Challan {
  id: string;
  challanNumber: string;
  date: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: ChallanItem[];
  totalQuantity: number;
  status: 'draft' | 'delivered';
  notes: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  supplierName: string;
  supplierAddress: string;
  supplierPhone: string;
  supplierEmail: string;
  items: LineItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'received';
  notes: string;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

export type DocumentType = 'invoice' | 'quotation' | 'challan' | 'purchaseOrder';
