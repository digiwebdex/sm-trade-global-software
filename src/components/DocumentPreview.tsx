import React from 'react';
import { CompanySettings, LineItem, ChallanItem } from '@/types';
import { numberToWords } from '@/utils/numberToWords';
import { storage } from '@/utils/storage';

interface DocumentPreviewProps {
  type: 'invoice' | 'quotation' | 'challan' | 'purchaseOrder';
  documentNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items?: LineItem[];
  challanItems?: ChallanItem[];
  totalAmount?: number;
  totalQuantity?: number;
  orderNo?: string;
  notes?: string;
  supplierName?: string;
  supplierAddress?: string;
}

export default function DocumentPreview(props: DocumentPreviewProps) {
  const settings: CompanySettings = storage.getSettings();
  const { type, documentNumber, date, customerName, customerAddress, customerPhone, items, challanItems, totalAmount, totalQuantity, orderNo, notes } = props;

  const typeLabels: Record<string, string> = {
    invoice: 'BILL / INVOICE',
    quotation: 'QUOTATION',
    challan: 'CHALLAN / DELIVERY NOTE',
    purchaseOrder: 'PURCHASE ORDER',
  };

  const toLabel = type === 'purchaseOrder' ? 'Supplier' : 'Bill To';

  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto text-sm" id="document-preview" style={{ fontFamily: 'Arial, sans-serif', color: '#1B3A5C' }}>
      {/* Header */}
      <div className="border-b-4" style={{ borderColor: '#1B3A5C' }}>
        <div className="flex justify-between items-start pb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B3A5C' }}>{settings.name}</h1>
            <p className="text-xs mt-1" style={{ color: '#E8792B' }}>{settings.tagline}</p>
          </div>
          <div className="text-right text-xs">
            <p>{settings.address}</p>
            <p>Phone: {settings.phone}</p>
            <p>Email: {settings.email}</p>
            <p>{settings.website}</p>
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center py-3" style={{ backgroundColor: '#1B3A5C', color: 'white', margin: '0 -2rem', padding: '0.5rem' }}>
        <h2 className="text-lg font-bold tracking-widest">{typeLabels[type]}</h2>
      </div>

      {/* Info Row */}
      <div className="flex justify-between py-4 border-b">
        <div>
          <p className="font-bold">{toLabel}:</p>
          <p className="font-medium">{props.supplierName || customerName}</p>
          <p className="text-xs">{props.supplierAddress || customerAddress}</p>
          <p className="text-xs">Phone: {customerPhone}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">No:</span> {documentNumber}</p>
          <p><span className="font-bold">Date:</span> {date}</p>
          {orderNo && <p><span className="font-bold">Order No:</span> {orderNo}</p>}
        </div>
      </div>

      {/* Items Table */}
      {type === 'challan' && challanItems ? (
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#1B3A5C', color: 'white' }}>
              <th className="border p-2 text-center w-12">SL</th>
              <th className="border p-2 text-left">Item Name & Details</th>
              <th className="border p-2 text-center">Size</th>
              <th className="border p-2 text-center">Delivery Qty</th>
              <th className="border p-2 text-center">Balance Qty</th>
              <th className="border p-2 text-center">Unit</th>
            </tr>
          </thead>
          <tbody>
            {challanItems.map((item, i) => (
              <tr key={item.id}>
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{item.itemName}{item.details ? <br /> : ''}<span className="text-xs">{item.details}</span></td>
                <td className="border p-2 text-center">{item.size}</td>
                <td className="border p-2 text-center">{item.deliveryQty}</td>
                <td className="border p-2 text-center">{item.balanceQty}</td>
                <td className="border p-2 text-center">{item.unit}</td>
              </tr>
            ))}
            <tr className="font-bold" style={{ backgroundColor: '#f0f4f8' }}>
              <td colSpan={3} className="border p-2 text-right">Total Quantity:</td>
              <td className="border p-2 text-center">{totalQuantity}</td>
              <td colSpan={2} className="border p-2"></td>
            </tr>
          </tbody>
        </table>
      ) : items ? (
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#1B3A5C', color: 'white' }}>
              <th className="border p-2 text-center w-12">SL</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-center w-20">Qty</th>
              <th className="border p-2 text-right w-28">Unit Price</th>
              <th className="border p-2 text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id}>
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{item.description}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 text-right">৳{item.unitPrice.toLocaleString()}</td>
                <td className="border p-2 text-right">৳{item.total.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold" style={{ backgroundColor: '#f0f4f8' }}>
              <td colSpan={4} className="border p-2 text-right">Total Amount:</td>
              <td className="border p-2 text-right">৳{totalAmount?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      ) : null}

      {/* Amount in Words */}
      {totalAmount !== undefined && totalAmount > 0 && (
        <div className="mt-3 p-2 border rounded text-xs" style={{ backgroundColor: '#fef9f0' }}>
          <strong>In Words:</strong> {numberToWords(totalAmount)}
        </div>
      )}

      {notes && (
        <div className="mt-3 text-xs">
          <strong>Notes:</strong> {notes}
        </div>
      )}

      {/* Signature Section */}
      <div className="flex justify-between mt-16 pt-4">
        <div className="text-center">
          <div className="border-t w-32 pt-1 text-xs">Received By</div>
        </div>
        <div className="text-center">
          <div className="border-t w-32 pt-1 text-xs">Prepared By</div>
        </div>
        <div className="text-center">
          <div className="border-t w-32 pt-1 text-xs">Authorized By</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t-2 text-center text-xs" style={{ borderColor: '#E8792B', color: '#666' }}>
        <p>{settings.name} | {settings.address} | {settings.phone} | {settings.email}</p>
      </div>
    </div>
  );
}

export function printDocument() {
  window.print();
}
