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
    invoice: { label: 'BILL', color: '#1B3A5C', bgColor: '#E8792B', toLabel: 'BILL TO', dateLabel: 'INVOICE DATE :' },
    quotation: { label: 'QUOTATION', color: '#1B3A5C', bgColor: '#E8792B', toLabel: 'TO', dateLabel: 'QUOTATION DATE :' },
    challan: { label: 'CHALLAN', color: '#1B3A5C', bgColor: '#E8792B', toLabel: 'DELIVERY TO', dateLabel: 'CHALLAN DATE' },
    purchaseOrder: { label: 'PURCHASE ORDER', color: '#1B3A5C', bgColor: '#E8792B', toLabel: 'TO', dateLabel: 'PO DATE :' },
  };

  const config = typeConfig[type];
  const isQuotation = type === 'quotation';
  const isChallan = type === 'challan';
  const tableHeaderBg = '#1B3A5C';

  // Generate QR code data URL (simple SVG-based placeholder)
  const qrCodeSvg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="45" text-anchor="middle" font-size="8" fill="#333">Made by S.M. Trade</text><text x="50" y="58" text-anchor="middle" font-size="7" fill="#666">Scan for details</text><rect x="10" y="10" width="25" height="25" fill="none" stroke="#333" stroke-width="2"/><rect x="65" y="10" width="25" height="25" fill="none" stroke="#333" stroke-width="2"/><rect x="10" y="65" width="25" height="25" fill="none" stroke="#333" stroke-width="2"/><rect x="15" y="15" width="15" height="15" fill="#333"/><rect x="70" y="15" width="15" height="15" fill="#333"/><rect x="15" y="70" width="15" height="15" fill="#333"/><rect x="40" y="10" width="5" height="5" fill="#333"/><rect x="50" y="15" width="5" height="5" fill="#333"/><rect x="45" y="25" width="5" height="5" fill="#333"/><rect x="40" y="40" width="5" height="5" fill="#333"/><rect x="50" y="45" width="5" height="5" fill="#333"/><rect x="60" y="50" width="5" height="5" fill="#333"/><rect x="70" y="60" width="5" height="5" fill="#333"/><rect x="80" y="70" width="5" height="5" fill="#333"/><rect x="65" y="75" width="5" height="5" fill="#333"/><rect x="75" y="80" width="5" height="5" fill="#333"/></svg>`)}`;

  const thStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    backgroundColor: tableHeaderBg,
    color: 'white',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: '2px solid ' + tableHeaderBg,
    ...extra,
  });

  const tdStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '7px 12px',
    borderBottom: '1px solid #e5e5e5',
    fontSize: '13px',
    ...extra,
  });

  return (
    <div className="bg-white mx-auto shadow-lg" id="document-preview" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#333', fontSize: '13px', width: '794px', minHeight: '1123px' }}>
      {/* Page border */}
      <div style={{ border: '2px solid #d0d0d0', padding: '0', minHeight: '1119px', display: 'flex', flexDirection: 'column' }}>
        
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
            borderLeft: '4px solid #1B3A5C', 
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
        <div style={{ padding: '10px 30px 0', position: 'relative', minHeight: '250px', flex: 1 }}>
          
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
                  <th style={thStyle({ width: '40px', textAlign: 'center' })}>SL.</th>
                  <th style={thStyle({ textAlign: 'left' })}>Item Name & Details</th>
                  <th style={thStyle({ width: '70px', textAlign: 'center' })}>Size</th>
                  <th style={thStyle({ width: '90px', textAlign: 'center' })}>Delivery Qty.</th>
                  <th style={thStyle({ width: '90px', textAlign: 'center' })}>Balance Qty.</th>
                  <th style={thStyle({ width: '50px', textAlign: 'center' })}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {challanItems.map((item, i) => (
                  <tr key={item.id}>
                    <td style={tdStyle({ textAlign: 'center' })}>{i + 1}</td>
                    <td style={tdStyle()}>{item.itemName}{item.details && <><br/><span style={{ fontSize: '11px', color: '#666' }}>{item.details}</span></>}</td>
                    <td style={tdStyle({ textAlign: 'center' })}>{item.size}</td>
                    <td style={tdStyle({ textAlign: 'center' })}>{item.deliveryQty} Paces</td>
                    <td style={tdStyle({ textAlign: 'center' })}>{item.balanceQty}</td>
                    <td style={tdStyle({ textAlign: 'center' })}>{item.unit}</td>
                  </tr>
                ))}
                {challanItems.length < 8 && Array.from({ length: 8 - challanItems.length }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td style={tdStyle()}>&nbsp;</td>
                    <td style={tdStyle()}></td>
                    <td style={tdStyle()}></td>
                    <td style={tdStyle()}></td>
                    <td style={tdStyle()}></td>
                    <td style={tdStyle()}></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white', fontSize: '13px' }}>Total Quantity</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>{totalQuantity} PCS</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>00</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#E8792B', color: 'white' }}>Unit</td>
                </tr>
              </tbody>
            </table>
          ) : items ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
              <thead>
                <tr>
                  {isQuotation && (
                    <th style={thStyle({ width: '40px', textAlign: 'center' })}>SL.</th>
                  )}
                  <th style={thStyle({ textAlign: 'left' })}>DESCRIPTION</th>
                  <th style={thStyle({ width: '80px', textAlign: 'center' })}>QTY</th>
                  <th style={thStyle({ width: '110px', textAlign: 'center' })}>UNIT PRICE</th>
                  <th style={thStyle({ width: '120px', textAlign: 'right' })}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id}>
                    {isQuotation && <td style={tdStyle({ textAlign: 'center' })}>{i + 1}</td>}
                    <td style={tdStyle()}>{item.description}</td>
                    <td style={tdStyle({ textAlign: 'center' })}>{item.quantity}</td>
                    <td style={tdStyle({ textAlign: 'center' })}>{formatNumber(item.unitPrice)}</td>
                    <td style={tdStyle({ textAlign: 'right', fontWeight: 'bold' })}>{formatNumber(item.total)}</td>
                  </tr>
                ))}
                {/* Empty rows */}
                {items.length < 6 && Array.from({ length: 6 - items.length }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    {isQuotation && <td style={tdStyle()}>&nbsp;</td>}
                    <td style={tdStyle()}>&nbsp;</td>
                    <td style={tdStyle()}></td>
                    <td style={tdStyle()}></td>
                    <td style={tdStyle()}></td>
                  </tr>
                ))}
                {/* Total Amount Row */}
                <tr>
                  <td colSpan={isQuotation ? 4 : 3} style={{ 
                    padding: '10px 12px', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    backgroundColor: '#E8792B', 
                    color: 'white',
                    fontSize: '13px',
                    borderTop: '2px solid #E8792B',
                  }}>
                    Total Amount
                  </td>
                  <td style={{ 
                    padding: '10px 12px', 
                    textAlign: 'right', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    borderTop: '2px solid #E8792B',
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
          fontSize: '11px', 
          color: '#555',
          backgroundColor: '#fafafa',
          position: 'relative',
        }}>
          <div style={{ textAlign: 'center' }}>
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
          {/* QR Code */}
          <div style={{ position: 'absolute', right: '20px', bottom: '8px' }}>
            <img src={qrCodeSvg} alt="QR Code" style={{ width: '60px', height: '60px' }} />
            <p style={{ fontSize: '7px', textAlign: 'center', margin: '2px 0 0', color: '#888' }}>Made by S.M. Trade<br/>Scan for details</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function printDocument() {
  window.print();
}
