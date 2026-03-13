import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { storage, KEYS } from '@/utils/storage';
import { generateId, generateDocNumber } from '@/utils/documentNumbers';
import { Invoice, LineItem, Customer } from '@/types';
import DocumentPreview, { printDocument } from '@/components/DocumentPreview';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, ArrowLeft, Search, Pencil, Printer } from 'lucide-react';

const emptyItem = (): LineItem => ({ id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 });

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { action } = useParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');

  const load = () => setInvoices(storage.getAll<Invoice>(KEYS.INVOICES));
  useEffect(() => { load(); }, [action]);

  if (action === 'new' || action?.startsWith('edit-')) {
    return <InvoiceForm editId={action.startsWith('edit-') ? action.replace('edit-', '') : undefined} onDone={() => { load(); navigate('/invoices'); }} />;
  }

  if (action?.startsWith('view-')) {
    return <InvoiceView id={action.replace('view-', '')} onBack={() => navigate('/invoices')} />;
  }

  const filtered = invoices.filter(i => i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || i.customerName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice?')) {
      storage.remove<Invoice>(KEYS.INVOICES, id);
      toast.success('Invoice deleted');
      load();
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      paid: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Paid' },
      sent: { className: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Due' },
      draft: { className: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Draft' },
    };
    const v = variants[status] || variants.draft;
    return <Badge variant="outline" className={`${v.className} font-semibold text-xs`}>{v.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices / Bills</h1>
          <p className="text-muted-foreground">Manage bills and invoices</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')} className="bg-secondary hover:bg-secondary/90">
          <Plus className="h-4 w-4 mr-2" /> New Invoice
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by invoice # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount (BDT)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No invoices found</TableCell></TableRow>
              ) : filtered.map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/invoices/view-${inv.id}`)}>
                  <TableCell className="font-bold text-primary">{inv.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{inv.customerName}</p>
                      <p className="text-xs text-muted-foreground">{inv.customerAddress}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                  <TableCell className="text-right font-bold">৳{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-center">{statusBadge(inv.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/invoices/view-${inv.id}`)} title="View"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/invoices/edit-${inv.id}`)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(inv.id)} className="text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceForm({ editId, onDone }: { editId?: string; onDone: () => void }) {
  const customers = storage.getAll<Customer>(KEYS.CUSTOMERS);
  const existing = editId ? storage.getById<Invoice>(KEYS.INVOICES, editId) : null;

  const [form, setForm] = useState({
    customerId: existing?.customerId || '',
    customerName: existing?.customerName || '',
    customerAddress: existing?.customerAddress || '',
    customerPhone: existing?.customerPhone || '',
    date: existing?.date || new Date().toISOString().split('T')[0],
    invoiceNumber: existing?.invoiceNumber || generateDocNumber('INV', storage.getAll<Invoice>(KEYS.INVOICES).map(i => i.invoiceNumber)),
    items: existing?.items || [emptyItem()],
    status: existing?.status || 'draft' as const,
    notes: existing?.notes || '',
    amountInWords: existing?.amountInWords || '',
  });

  const selectCustomer = (id: string) => {
    const c = customers.find(c => c.id === id);
    if (c) setForm({ ...form, customerId: c.id, customerName: c.name, customerAddress: `${c.organization}\n${c.address}`, customerPhone: c.phone });
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const items = [...form.items];
    (items[index] as any)[field] = value;
    items[index].total = items[index].quantity * items[index].unitPrice;
    setForm({ ...form, items });
  };

  const totalAmount = form.items.reduce((s, i) => s + i.total, 0);

  const handleSave = () => {
    if (!form.customerName) { toast.error('Select a customer'); return; }
    if (form.items.every(i => !i.description)) { toast.error('Add at least one item'); return; }
    const data: Invoice = { ...form, id: editId || generateId(), totalAmount, createdAt: existing?.createdAt || new Date().toISOString() };
    if (editId) storage.update<Invoice>(KEYS.INVOICES, editId, data);
    else storage.create<Invoice>(KEYS.INVOICES, data);
    toast.success(editId ? 'Invoice updated' : 'Invoice created');
    onDone();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onDone}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <h1 className="text-2xl font-bold">{editId ? 'Edit Invoice' : 'New Invoice'}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Invoice #</label><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="font-bold" /></div>
              <div><label className="text-sm font-medium">Date</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Select Customer (or type manually below)</label>
              <Select value={form.customerId} onValueChange={selectCustomer}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.organization}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div><label className="text-sm font-medium">Customer Name *</label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" /></div>
              <div><label className="text-sm font-medium">Customer Address</label><Textarea value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} placeholder="Address" rows={2} /></div>
              <div><label className="text-sm font-medium">Customer Phone</label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="Phone" /></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v: 'draft' | 'sent' | 'paid') => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Due</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Line Items</label>
                <Button size="sm" variant="outline" onClick={() => setForm({ ...form, items: [...form.items, emptyItem()] })}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-5" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                    <Input className="col-span-2" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} />
                    <Input className="col-span-2" type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    <div className="col-span-2 text-right text-sm font-medium">৳{item.total.toLocaleString()}</div>
                    <Button size="icon" variant="ghost" className="col-span-1 text-destructive" onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
              <div className="text-right mt-3 text-lg font-bold" style={{ color: '#1B3A5C' }}>Total: ৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div><label className="text-sm font-medium">Amount in Words</label><Input value={form.amountInWords} onChange={(e) => setForm({ ...form, amountInWords: e.target.value })} placeholder="Auto-generated if empty" /></div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90">Save Invoice</Button>
          </CardContent>
        </Card>
        <div className="print-target">
          <DocumentPreview type="invoice" documentNumber={form.invoiceNumber} date={form.date} customerName={form.customerName} customerAddress={form.customerAddress} customerPhone={form.customerPhone} items={form.items} totalAmount={totalAmount} notes={form.notes} status={form.status} amountInWords={form.amountInWords} />
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ id, onBack }: { id: string; onBack: () => void }) {
  const inv = storage.getById<Invoice>(KEYS.INVOICES, id);
  if (!inv) return <div>Invoice not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 no-print">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <h1 className="text-2xl font-bold">Invoice {inv.invoiceNumber}</h1>
        <Badge variant="outline" className={inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>
          {inv.status === 'sent' ? 'Due' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
        </Badge>
        <Button onClick={printDocument} variant="outline"><Printer className="h-4 w-4 mr-2" /> Print / PDF</Button>
      </div>
      <DocumentPreview type="invoice" documentNumber={inv.invoiceNumber} date={inv.date} customerName={inv.customerName} customerAddress={inv.customerAddress} customerPhone={inv.customerPhone} items={inv.items} totalAmount={inv.totalAmount} notes={inv.notes} status={inv.status} />
    </div>
  );
}
