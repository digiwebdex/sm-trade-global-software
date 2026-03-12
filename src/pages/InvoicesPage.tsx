import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-foreground">Invoices</h1><p className="text-muted-foreground">Manage bills and invoices</p></div>
        <Button onClick={() => navigate('/invoices/new')} className="bg-secondary hover:bg-secondary/90"><Plus className="h-4 w-4 mr-2" /> New Invoice</Button>
      </div>
      <Card>
        <CardHeader><div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="w-32">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No invoices found</TableCell></TableRow>
              ) : filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.customerName}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>৳{inv.totalAmount.toLocaleString()}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'paid' ? 'bg-success/20 text-success' : inv.status === 'sent' ? 'bg-info/20 text-info' : 'bg-muted text-muted-foreground'}`}>{inv.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/invoices/view-${inv.id}`)}><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/invoices/edit-${inv.id}`)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(inv.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
  });

  const selectCustomer = (id: string) => {
    const c = customers.find(c => c.id === id);
    if (c) setForm({ ...form, customerId: c.id, customerName: c.name, customerAddress: c.address, customerPhone: c.phone });
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
              <div><label className="text-sm font-medium">Invoice #</label><Input value={form.invoiceNumber} readOnly className="bg-muted" /></div>
              <div><label className="text-sm font-medium">Date</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select value={form.customerId} onValueChange={selectCustomer}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.organization}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.customerName && <div className="text-xs text-muted-foreground p-2 bg-muted rounded"><p>{form.customerName}</p><p>{form.customerAddress}</p><p>{form.customerPhone}</p></div>}
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={form.status} onValueChange={(v: 'draft' | 'sent' | 'paid') => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
              </Select>
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
              <div className="text-right mt-3 text-lg font-bold">Total: ৳{totalAmount.toLocaleString()}</div>
            </div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90">Save Invoice</Button>
          </CardContent>
        </Card>
        <div className="print-target">
          <DocumentPreview type="invoice" documentNumber={form.invoiceNumber} date={form.date} customerName={form.customerName} customerAddress={form.customerAddress} customerPhone={form.customerPhone} items={form.items} totalAmount={totalAmount} notes={form.notes} />
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
        <Button onClick={printDocument} variant="outline"><Printer className="h-4 w-4 mr-2" /> Print / PDF</Button>
      </div>
      <DocumentPreview type="invoice" documentNumber={inv.invoiceNumber} date={inv.date} customerName={inv.customerName} customerAddress={inv.customerAddress} customerPhone={inv.customerPhone} items={inv.items} totalAmount={inv.totalAmount} notes={inv.notes} />
    </div>
  );
}
