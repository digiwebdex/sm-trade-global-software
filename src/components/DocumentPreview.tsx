import React from 'react';
import { CompanySettings, LineItem, ChallanItem } from '@/types';
import { numberToWords } from '@/utils/numberToWords';
import { storage } from '@/utils/storage';
import logoImg from '@/assets/logo.png';

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
  status?: string;
}

const formatNumber = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
};

export default function DocumentPreview(props: DocumentPreviewProps) {
  const settings: CompanySettings = storage.getSettings();
  const { type, documentNumber, date, customerName, customerAddress, customerPhone, items, challanItems, totalAmount, totalQuantity, orderNo, notes, status } = props;

  const typeConfig: Record<string, { label: string; color: string; bgColor: string; toLabel: string; dateLabel: string }> = {
    invoice: { label: 'BILL', color: '#1B3A5C', bgColor: '#1B3A5C', toLabel: 'BILL TO', dateLabel: 'INVOICE DATE :' },
    quotation: { label: 'QUOTATION', color: '#1B3A5C', bgColor: '#6B5B95', toLabel: 'TO', dateLabel: 'QUOTATION DATE :' },
    challan: { label: 'CHALLAN', color: '#1B3A5C', bgColor: '#E8792B', toLabel: 'DELIVERY TO', dateLabel: 'CHALLAN DATE' },
    purchaseOrder: { label: 'PURCHASE ORDER', color: '#1B3A5C', bgColor: '#1B3A5C', toLabel: 'TO', dateLabel: 'PO DATE :' },
  };

  const config = typeConfig[type];
  const isQuotation = type === 'quotation';
  const isChallan = type === 'challan';
  const tableHeaderBg = isQuotation ? '#6B5B95' : isChallan ? '#E8792B' : '#1B3A5C';

  return (
    <div className="bg-white max-w-[800px] mx-auto shadow-lg" id="document-preview" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#333', fontSize: '13px' }}>
      {/* Page border */}
      <div style={{ border: '2px solid #e0e0e0', padding: '0' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 30px 15px', borderBottom: `3px solid ${config.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={logoImg} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: config.color, margin: 0, letterSpacing: '0.5px' }}>
                  S. M. TRADE INTERNATIONAL
                </h1>
                <p style={{ fontSize: '11px', color: '#E8792B', margin: '2px 0 0', fontStyle: 'italic' }}>
                  {settings.tagline}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: config.color, margin: 0 }}>
                {config.label}
              </h2>
              <div style={{ 
                backgroundColor: config.bgColor, 
                color: 'white', 
                padding: '3px 12px', 
                borderRadius: '3px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                display: 'inline-block',
                marginTop: '4px'
              }}>
                {documentNumber}
              </div>
              {isChallan && orderNo && (
                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Order No. {orderNo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ 
            borderLeft: isQuotation ? '4px solid #6B5B95' : isChallan ? '4px solid #E8792B' : '4px solid #1B3A5C', 
            paddingLeft: '12px',
            flex: 1
          }}>
            <p style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', marginBottom: '4px' }}>{config.toLabel}</p>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', margin: '0 0 2px' }}>
              {props.supplierName || customerName}
            </p>
            <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>
              {props.supplierAddress || customerAddress}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <p style={{ margin: 0 }}>
              <span style={{ color: '#888' }}>{config.dateLabel}</span>{' '}
              <strong>{formatDate(date)}</strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ padding: '10px 30px 0', position: 'relative', minHeight: '250px' }}>
          
          {/* Watermark */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.06,
            zIndex: 0,
            pointerEvents: 'none',
          }}>
            <img src={logoImg} alt="" style={{ width: '300px', height: '300px' }} />
          </div>

          {isChallan && challanItems ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '40px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>SL.</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Item Name & Details</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '70px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Size</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '90px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Delivery Qty.</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '90px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Balance Qty.</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '50px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {challanItems.map((item, i) => (
                  <tr key={item.id}>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{item.itemName}{item.details && <><br/><span style={{ fontSize: '11px', color: '#666' }}>{item.details}</span></>}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.size}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.deliveryQty} Paces</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.balanceQty}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.unit}</td>
                  </tr>
                ))}
                {/* Empty rows for visual padding */}
                {challanItems.length < 8 && Array.from({ length: 8 - challanItems.length }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>&nbsp;</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ padding: '8px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>Total Quantity</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>{totalQuantity} PCS</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>00</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>Unit</td>
                </tr>
              </tbody>
            </table>
          ) : items ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
              <thead>
                <tr>
                  {isQuotation && (
                    <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '40px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>SL.</th>
                  )}
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>DESCRIPTION</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '80px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>QTY</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '100px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>UNIT PRICE</th>
                  <th style={{ backgroundColor: tableHeaderBg, color: 'white', padding: '8px 10px', border: '1px solid #ddd', width: '110px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id}>
                    {isQuotation && <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{i + 1}</td>}
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{item.description}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'center' }}>{formatNumber(item.unitPrice)}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(item.total)}</td>
                  </tr>
                ))}
                {/* Empty rows */}
                {items.length < 6 && Array.from({ length: 6 - items.length }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    {isQuotation && <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>&nbsp;</td>}
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>&nbsp;</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                    <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}></td>
                  </tr>
                ))}
                {/* Total Amount Row */}
                <tr>
                  <td colSpan={isQuotation ? 4 : 3} style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    textAlign: 'right', 
                    fontWeight: 'bold', 
                    backgroundColor: '#E8792B', 
                    color: 'white',
                    fontSize: '13px'
                  }}>
                    Total Amount
                  </td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    textAlign: 'right', 
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>
                    BDT, {formatNumber(totalAmount || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : null}

          {/* Amount in Words */}
          {totalAmount !== undefined && totalAmount > 0 && !isChallan && (
            <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '12px', color: config.color, marginTop: '5px' }}>
              <strong>In Word :</strong> {numberToWords(totalAmount)}.
            </div>
          )}
        </div>

        {notes && (
          <div style={{ padding: '0 30px', fontSize: '11px', color: '#666' }}>
            <strong>Notes:</strong> {notes}
          </div>
        )}

        {/* Signature Section */}
        <div style={{ padding: '60px 30px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center', width: '150px' }}>
            <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '12px', color: '#555' }}>Received by</div>
          </div>
          <div style={{ textAlign: 'center', width: '150px' }}>
            <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '12px', color: '#555' }}>Prepared by</div>
          </div>
          <div style={{ textAlign: 'center', width: '150px' }}>
            <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '12px', color: '#555' }}>Authorize by</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '2px solid #E8792B', 
          padding: '12px 30px', 
          textAlign: 'center', 
          fontSize: '11px', 
          color: '#555',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '4px' }}>
            <span>✉ {settings.email}</span>
            <span>🌐 {settings.website}</span>
          </div>
          <p style={{ margin: '2px 0' }}>📍 Address : {settings.address}</p>
          <p style={{ margin: '2px 0' }}>📍 B-25/4, Al-Baraka Super Market, Office # 9-10, Mojidpur Road, Savar, Dhaka-1340</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '4px' }}>
            <span>📞 {settings.phone}</span>
            <span>📠 +8802244446664</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function printDocument() {
  window.print();
}
