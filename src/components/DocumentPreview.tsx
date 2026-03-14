import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CompanySettings, LineItem, ChallanItem, Payment } from '@/types';
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
  customerEmail?: string;
  items?: LineItem[];
  challanItems?: ChallanItem[];
  totalAmount?: number;
  totalQuantity?: number;
  orderNo?: string;
  notes?: string;
  amountInWords?: string;
  tax?: number;
  totalPaid?: number;
  payments?: Payment[];
  supplierName?: string;
  supplierAddress?: string;
  status?: string;
  signatureReceived?: string;
  signaturePrepared?: string;
  signatureAuthorize?: string;
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
const GREEN = '#16a34a';

export default function DocumentPreview(props: DocumentPreviewProps) {
  const settings: CompanySettings = storage.getSettings();
  const { type, documentNumber, date, customerName, customerAddress, customerPhone, customerEmail, items, challanItems, totalAmount, totalQuantity, orderNo, notes, tax, totalPaid, payments } = props;

  const typeConfig: Record<string, { label: string; toLabel: string; dateLabel: string }> = {
    invoice: { label: 'BILL', toLabel: 'BILL TO', dateLabel: 'BILL DATE :' },
    quotation: { label: 'QUOTATION', toLabel: 'TO', dateLabel: 'QUOTATION DATE :' },
    challan: { label: 'CHALLAN', toLabel: 'DELIVERY TO', dateLabel: 'CHALLAN DATE :' },
    purchaseOrder: { label: 'PURCHASE ORDER', toLabel: 'TO', dateLabel: 'PO DATE :' },
  };

  const config = typeConfig[type];

  // Generate real QR code linking to the document view
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    const routeMap: Record<string, string> = {
      invoice: 'invoices', quotation: 'quotations', challan: 'challans', purchaseOrder: 'purchase-orders',
    };
    const baseUrl = window.location.origin;
    const docId = documentNumber.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const viewUrl = `${baseUrl}/${routeMap[type]}/view-${docId}`;
    QRCode.toDataURL(viewUrl, { width: 120, margin: 1, color: { dark: '#1B3A5C', light: '#ffffff' } })
      .then(url => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [documentNumber, type]);
  const isChallan = type === 'challan';
  const isInvoice = type === 'invoice';

  const subtotal = totalAmount || 0;
  const taxAmount = tax || 0;
  const grandTotal = subtotal + taxAmount;
  const paidAmount = totalPaid || 0;
  const balance = grandTotal - paidAmount;

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    paid: { color: GREEN, bg: '#dcfce7', label: 'Paid' },
    partial: { color: ORANGE, bg: '#fff7ed', label: 'Partial' },
    sent: { color: '#dc2626', bg: '#fef2f2', label: 'Unpaid' },
    draft: { color: '#6b7280', bg: '#f3f4f6', label: 'Draft' },
    accepted: { color: GREEN, bg: '#dcfce7', label: 'Accepted' },
    rejected: { color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
    delivered: { color: GREEN, bg: '#dcfce7', label: 'Delivered' },
    received: { color: GREEN, bg: '#dcfce7', label: 'Received' },
  };

  const statusInfo = statusConfig[props.status || 'draft'] || statusConfig.draft;

  // QR code is now generated via useEffect above

  return (
    <div className="bg-white mx-auto shadow-lg document-preview-wrapper" id="document-preview" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#333', fontSize: '13px', width: '794px', minHeight: '1123px', maxHeight: '1123px', overflow: 'hidden' }}>
      <div style={{ border: '2px solid #d0d0d0', minHeight: '1119px', maxHeight: '1119px', display: 'flex', flexDirection: 'column' }} className="document-border">
        
        {/* ===== HEADER ===== */}
        <div style={{ padding: '18px 35px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '50%', 
                border: '2.5px solid #2B5797', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden', backgroundColor: '#fff'
              }}>
                <img src={logoImg} alt="Logo" style={{ width: '62px', height: '62px', objectFit: 'contain' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1f3b8a', margin: 0, letterSpacing: '0px', fontFamily: "'Arial Black', 'Helvetica', sans-serif", textTransform: 'uppercase' }}>
                  S. M. TRADE INTERNATIONAL
                </h1>
                <p style={{ fontSize: '13px', color: '#333', margin: '4px 0 0', fontWeight: 'normal', fontStyle: 'italic', fontFamily: "'Times New Roman', 'Georgia', serif", letterSpacing: '0.2px' }}>
                  1st Class Govt. Contractor, Supplier &amp; Importer
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: NAVY, margin: 0, fontFamily: "'Arial Black', 'Helvetica', sans-serif" }}>
                {config.label}
              </h2>
              <p style={{ 
                color: ORANGE, fontSize: '14px', fontWeight: 'bold', marginTop: '6px', margin: '6px 0 0'
              }}>
                {documentNumber}
              </p>
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
            {customerEmail && (
              <p style={{ fontSize: '11px', color: ORANGE, margin: '1px 0', lineHeight: '1.4' }}>{customerEmail}</p>
            )}
            {customerPhone && (
              <p style={{ fontSize: '11px', color: GREEN, margin: '1px 0', lineHeight: '1.4' }}>{customerPhone}</p>
            )}
            <p style={{ fontSize: '11px', color: '#555', margin: '1px 0', lineHeight: '1.4' }}>
              {props.supplierAddress || customerAddress}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#888', fontSize: '11px', fontStyle: 'italic' }}>{config.dateLabel}</span>{' '}
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
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '90px' }}>DELIVERY QUANTITY</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: NAVY, width: '90px' }}>BALANCE QUANTITY</th>
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
                <tr style={{ backgroundColor: NAVY }}>
                  <td colSpan={3} style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>Total Quantity</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>{totalQuantity} PCS</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>00</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>Unit</td>
                </tr>
              </tbody>
            </table>
          ) : items ? (
            /* ===== INVOICE / QUOTATION / PO TABLE ===== */
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>DESCRIPTION</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', width: '80px' }}>QUANTITY</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', width: '110px' }}>UNIT PRICE</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', width: '120px' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                      <td style={{ padding: '7px 8px', fontSize: '12px' }}>{item.description}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: '12px' }}>{item.quantity}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontSize: '12px' }}>৳{formatNumber(item.unitPrice)}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>৳{formatNumber(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ===== SUMMARY SECTION (right-aligned) ===== */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '280px' }}>
                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e8e8e8' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Subtotal</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>৳{formatNumber(subtotal)}</span>
                  </div>
                  {/* Tax */}
                  {isInvoice && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e8e8e8' }}>
                      <span style={{ fontSize: '12px', color: '#555' }}>Tax</span>
                      <span style={{ fontSize: '12px' }}>৳{formatNumber(taxAmount)}</span>
                    </div>
                  )}
                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e8e8e8' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: NAVY }}>Total</span>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: NAVY }}>৳{formatNumber(isInvoice ? grandTotal : subtotal)}</span>
                  </div>
                  {/* Total Paid (invoice only) */}
                  {isInvoice && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e8e8e8' }}>
                      <span style={{ fontSize: '12px', color: '#555' }}>Total Paid</span>
                      <span style={{ fontSize: '12px', color: GREEN }}>৳{formatNumber(paidAmount)}</span>
                    </div>
                  )}
                  {/* Balance (invoice only) */}
                  {isInvoice && (
                    <div style={{ 
                      display: 'flex', justifyContent: 'space-between', padding: '8px 10px', marginTop: '4px',
                      backgroundColor: balance > 0 ? '#fef2f2' : '#dcfce7',
                      border: `1px solid ${balance > 0 ? '#fca5a5' : '#86efac'}`,
                      borderRadius: '4px',
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: balance > 0 ? '#dc2626' : GREEN }}>Balance</span>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: balance > 0 ? '#dc2626' : GREEN }}>৳{formatNumber(balance)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {/* Amount in Words */}
          {totalAmount !== undefined && totalAmount > 0 && !isChallan && (
            <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '11px', color: NAVY, marginTop: '4px' }}>
              <strong>In Word :</strong> {props.amountInWords || numberToWords(isInvoice ? balance : subtotal)}.
            </div>
          )}

          {/* ===== PAYMENT HISTORY (invoice only) ===== */}
          {isInvoice && payments && payments.length > 0 && (
            <div style={{ marginTop: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                  <strong style={{ fontSize: '12px', color: NAVY }}>PAYMENT HISTORY</strong>
                </div>
                {payments.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#666' }}>{formatDate(p.date)}</span>
                      <span style={{ 
                        backgroundColor: NAVY, color: 'white', padding: '2px 8px', borderRadius: '3px',
                        fontSize: '10px', fontWeight: 'bold',
                      }}>{p.method}</span>
                      <span style={{ fontSize: '11px', color: '#555' }}>{p.description}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', color: GREEN }}>৳{formatNumber(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {notes && (
          <div style={{ padding: '8px 35px', fontSize: '11px', color: '#666' }}>
            <strong>Notes:</strong> {notes}
          </div>
        )}

        {/* ===== SIGNATURE SECTION ===== */}
        <div style={{ padding: '20px 35px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {[
            { label: 'Received by', sig: props.signatureReceived || settings.signatureReceived },
            { label: 'Prepared by', sig: props.signaturePrepared || settings.signaturePrepared },
            { label: 'Authorize by', sig: props.signatureAuthorize || settings.signatureAuthorize },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center', width: '160px' }}>
              <div style={{
                width: '160px', height: '70px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px',
              }}>
                {item.sig ? (
                  <img src={item.sig} alt={item.label} style={{ maxWidth: '140px', maxHeight: '60px', objectFit: 'contain' }} />
                ) : null}
              </div>
              <div style={{ borderTop: '1.5px solid #333', paddingTop: '5px', fontSize: '11px', color: '#555' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* ===== THANK YOU MESSAGE ===== */}
        <div style={{ textAlign: 'center', padding: '8px 35px', fontSize: '12px', color: ORANGE, fontStyle: 'italic', marginTop: 'auto' }}>
          Thank you for staying with us.
        </div>

        {/* ===== FOOTER ===== */}
        <div style={{ 
          borderTop: `2px solid ${ORANGE}`, padding: '10px 35px 0', fontSize: '10px', color: '#555',
          position: 'relative',
        }}>
          <div style={{ textAlign: 'center', paddingRight: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '4px' }}>
              <span><span style={{ color: '#2563eb' }}>✉</span> {settings.email}</span>
              <span><span style={{ color: '#16a34a' }}>🌐</span> {settings.website}</span>
            </div>
            <p style={{ margin: '2px 0' }}><span style={{ color: '#dc2626' }}>📍</span> Address : House # 7, Road # 19/A, Sector # 4, Uttara, Dhaka-1230</p>
            <p style={{ margin: '2px 0' }}><span style={{ color: '#dc2626' }}>📍</span> B-25/4, Al-Baraka Super Market, Office # 9-10, Mojidpur Road, Savar, Dhaka-1340</p>
          </div>
          {/* QR Code */}
          <div style={{ position: 'absolute', right: '25px', top: '8px', textAlign: 'center' }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" style={{ width: '58px', height: '58px', borderRadius: '3px' }} />
            ) : (
              <div style={{ width: '58px', height: '58px', backgroundColor: '#f0f0f0', borderRadius: '3px' }} />
            )}
            <p style={{ fontSize: '6px', margin: '2px 0 0', color: '#999' }}>Scan for details</p>
          </div>
        </div>
        {/* Phone bar */}
        <div style={{ 
          backgroundColor: '#e5e7eb', padding: '5px 35px', fontSize: '10px', color: '#555',
          display: 'flex', justifyContent: 'center', gap: '24px',
        }}>
          <span><span style={{ color: '#16a34a' }}>📞</span> {settings.phone}</span>
          <span><span style={{ color: '#2563eb' }}>📠</span> +8802244446664</span>
        </div>
      </div>
    </div>
  );
}

export function printDocument(docNumber?: string) {
  if (docNumber) {
    document.title = docNumber;
  }
  window.print();
  if (docNumber) {
    document.title = 'S. M. Trade International';
  }
}
