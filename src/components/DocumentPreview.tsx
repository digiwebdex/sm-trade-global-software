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

const NAVY = '#1B3A5C';
const ORANGE = '#E8792B';

export default function DocumentPreview(props: DocumentPreviewProps) {
  const settings: CompanySettings = storage.getSettings();
  const { type, documentNumber, date, customerName, customerAddress, customerPhone, items, challanItems, totalAmount, totalQuantity, orderNo, notes } = props;

  const typeConfig: Record<string, { label: string; toLabel: string; dateLabel: string }> = {
    invoice: { label: 'BILL', toLabel: 'BILL TO', dateLabel: 'INVOICE DATE :' },
    quotation: { label: 'QUOTATION', toLabel: 'TO', dateLabel: 'QUOTATION DATE :' },
    challan: { label: 'CHALLAN', toLabel: 'DELIVERY TO', dateLabel: 'CHALLAN DATE :' },
    purchaseOrder: { label: 'PURCHASE ORDER', toLabel: 'TO', dateLabel: 'PO DATE :' },
  };

  const config = typeConfig[type];
  const isChallan = type === 'challan';
  const isQuotation = type === 'quotation';

  const qrCodeSvg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="45" text-anchor="middle" font-size="8" fill="#333">Made by S.M. Trade</text><text x="50" y="58" text-anchor="middle" font-size="7" fill="#666">Scan for details</text><rect x="10" y="10" width="25" height="25" fill="none" stroke="#333" stroke-width="2"/><rect x="65" y="10" width="25" height="25" fill="none" stroke="#333" stroke-width="2"/><rect x="10" y="65" width="25" height="25" fill="none" stroke="#333" stroke-width="2"/><rect x="15" y="15" width="15" height="15" fill="#333"/><rect x="70" y="15" width="15" height="15" fill="#333"/><rect x="15" y="70" width="15" height="15" fill="#333"/><rect x="40" y="10" width="5" height="5" fill="#333"/><rect x="50" y="15" width="5" height="5" fill="#333"/><rect x="45" y="25" width="5" height="5" fill="#333"/><rect x="40" y="40" width="5" height="5" fill="#333"/><rect x="50" y="45" width="5" height="5" fill="#333"/><rect x="60" y="50" width="5" height="5" fill="#333"/><rect x="70" y="60" width="5" height="5" fill="#333"/><rect x="80" y="70" width="5" height="5" fill="#333"/><rect x="65" y="75" width="5" height="5" fill="#333"/><rect x="75" y="80" width="5" height="5" fill="#333"/></svg>`)}`;

  return (
    <div className="bg-white mx-auto shadow-lg document-preview-wrapper" id="document-preview" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#333', fontSize: '13px', width: '794px', minHeight: '1123px' }}>
      <div style={{ border: '2px solid #d0d0d0', minHeight: '1119px', display: 'flex', flexDirection: 'column' }} className="document-border">
        
        {/* ===== HEADER ===== */}
        <div style={{ padding: '24px 35px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={logoImg} alt="Logo" style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '21px', fontWeight: 'bold', color: NAVY, margin: 0, letterSpacing: '0.5px' }}>
                  S. M. TRADE INTERNATIONAL
                </h1>
                <p style={{ fontSize: '11px', color: ORANGE, margin: '2px 0 0', fontStyle: 'italic' }}>
                  {settings.tagline}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: NAVY, margin: 0 }}>
                {config.label}
              </h2>
              <div style={{ 
                backgroundColor: ORANGE, color: 'white', padding: '3px 14px', borderRadius: '3px', 
                fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px'
              }}>
                {documentNumber}
              </div>
              {isChallan && orderNo && (
                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Order No. {orderNo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Thin blue separator */}
        <div style={{ height: '2px', backgroundColor: NAVY, margin: '0 35px' }} />

        {/* ===== CUSTOMER INFO + DATE ===== */}
        <div style={{ padding: '14px 35px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', marginBottom: '3px', letterSpacing: '0.5px' }}>{config.toLabel}</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', margin: '0 0 2px' }}>
              {props.supplierName || customerName}
            </p>
            <p style={{ fontSize: '11px', color: '#555', margin: 0, lineHeight: '1.4' }}>
              {props.supplierAddress || customerAddress}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#888', fontSize: '11px' }}>{config.dateLabel}</span>{' '}
            <strong style={{ color: '#222' }}>{formatDate(date)}</strong>
          </div>
        </div>

        {/* ===== TABLE AREA ===== */}
        <div style={{ padding: '6px 35px 0', position: 'relative', flex: 1 }}>
          
          {/* Watermark */}
          <div style={{
            position: 'absolute', top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)', opacity: 0.06, zIndex: 0, pointerEvents: 'none',
          }}>
            <img src={logoImg} alt="" style={{ width: '320px', height: '320px' }} />
          </div>

          {isChallan && challanItems ? (
            /* ===== CHALLAN TABLE ===== */
            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '35px' }}>SL.</th>
                  <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold', color: NAVY }}>ITEM NAME & DETAILS</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '65px' }}>SIZE</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '90px' }}>DELIVERY QTY.</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '90px' }}>BALANCE QTY.</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '50px' }}>UNIT</th>
                </tr>
              </thead>
              <tbody>
                {challanItems.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '12px' }}>{i + 1}</td>
                    <td style={{ padding: '6px 8px', fontSize: '12px' }}>{item.itemName}{item.details && <><br/><span style={{ fontSize: '10px', color: '#666' }}>{item.details}</span></>}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '12px' }}>{item.size}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '12px' }}>{item.deliveryQty} Paces</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '12px' }}>{item.balanceQty}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '12px' }}>{item.unit}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: ORANGE }}>
                  <td colSpan={3} style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>Total Quantity</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>{totalQuantity} PCS</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>00</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>Unit</td>
                </tr>
              </tbody>
            </table>
          ) : items ? (
            /* ===== INVOICE / QUOTATION / PO TABLE ===== */
            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                  {isQuotation && (
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, textTransform: 'uppercase', width: '35px' }}>SL.</th>
                  )}
                  <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold', color: NAVY, textTransform: 'uppercase' }}>DESCRIPTION</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, textTransform: 'uppercase', width: '80px' }}>QTY</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, textTransform: 'uppercase', width: '110px' }}>UNIT PRICE</th>
                  <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', color: NAVY, textTransform: 'uppercase', width: '120px' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                    {isQuotation && <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: '12px' }}>{i + 1}</td>}
                    <td style={{ padding: '7px 8px', fontSize: '12px' }}>{item.description}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: '12px' }}>{item.quantity}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: '12px' }}>{formatNumber(item.unitPrice)}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>{formatNumber(item.total)}</td>
                  </tr>
                ))}
                {/* Total Amount Row */}
                <tr style={{ borderTop: `2px solid ${ORANGE}` }}>
                  <td colSpan={isQuotation ? 4 : 3} style={{ 
                    padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', 
                    backgroundColor: ORANGE, color: 'white', fontSize: '13px',
                  }}>
                    Total Amount
                  </td>
                  <td style={{ 
                    padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '13px',
                  }}>
                    BDT, {formatNumber(totalAmount || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : null}

          {/* Amount in Words */}
          {totalAmount !== undefined && totalAmount > 0 && !isChallan && (
            <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '11px', color: NAVY, marginTop: '4px' }}>
              <strong>In Word :</strong> {numberToWords(totalAmount)}.
            </div>
          )}
        </div>

        {notes && (
          <div style={{ padding: '0 35px', fontSize: '11px', color: '#666' }}>
            <strong>Notes:</strong> {notes}
          </div>
        )}

        {/* ===== SIGNATURE SECTION ===== */}
        <div style={{ padding: '50px 35px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '11px', color: '#555' }}>Received by</div>
          </div>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '11px', color: '#555' }}>Prepared by</div>
          </div>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '11px', color: '#555' }}>Authorize by</div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={{ 
          borderTop: `2px solid ${ORANGE}`, padding: '10px 35px', fontSize: '10px', color: '#666',
          backgroundColor: '#fafafa', position: 'relative',
        }}>
          <div style={{ textAlign: 'center', paddingRight: '70px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '3px' }}>
              <span>✉ {settings.email}</span>
              <span>🌐 {settings.website}</span>
            </div>
            <p style={{ margin: '2px 0' }}>📍 Address : {settings.address}</p>
            <p style={{ margin: '2px 0' }}>📍 B-25/4, Al-Baraka Super Market, Office # 9-10, Mojidpur Road, Savar, Dhaka-1340</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: '3px' }}>
              <span>📞 {settings.phone}</span>
              <span>📠 +8802244446664</span>
            </div>
          </div>
          {/* QR Code */}
          <div style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)' }}>
            <img src={qrCodeSvg} alt="QR Code" style={{ width: '55px', height: '55px' }} />
            <p style={{ fontSize: '6px', textAlign: 'center', margin: '1px 0 0', color: '#999' }}>Scan for details</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function printDocument() {
  window.print();
}
