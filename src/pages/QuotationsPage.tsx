import React, { useState, useEffect } from 'react';
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
import { Quotation, LineItem, Customer } from '@/types';
import DocumentPreview, { printDocument } from '@/components/DocumentPreview';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, ArrowLeft, Search, Pencil, Printer } from 'lucide-react';

const emptyItem = (): LineItem => ({ id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 });

export default function QuotationsPage() {
  const navigate = useNavigate();
  const { action } = useParams();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState('');

  const load = () => setQuotations(storage.getAll<Quotation>(KEYS.QUOTATIONS));
  useEffect(() => { load(); }, [action]);

  if (action === 'new' || action?.startsWith('edit-')) {
    return <QuotationForm editId={action.startsWith('edit-') ? action.replace('edit-', '') : undefined} onDone={() => { load(); navigate('/quotations'); }} />;
  }
  if (action?.startsWith('view-')) {
    return <QuotationView id={action.replace('view-', '')} onBack={() => navigate('/quotations')} />;
  }

  const filtered = quotations.filter(q => q.quotationNumber.toLowerCase().includes(search.toLowerCase()) || q.customerName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (confirm('Delete this quotation?')) { storage.remove<Quotation>(KEYS.QUOTATIONS, id); toast.success('Deleted'); load(); }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      accepted: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Accepted' },
      sent: { className: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Sent' },
      rejected: { className: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
      draft: { className: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Draft' },
    };
    const v = variants[status] || variants.draft;
    return <Badge variant="outline" className={`${v.className} font-semibold text-xs`}>{v.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotations</h1>
          <p className="text-muted-foreground">Manage quotations</p>
        </div>
        <Button onClick={() => navigate('/quotations/new')} className="bg-secondary hover:bg-secondary/90"><Plus className="h-4 w-4 mr-2" /> New Quotation</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by quotation # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount (BDT)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No quotations found</TableCell></TableRow>
              ) : filtered.map((q) => (
                <TableRow key={q.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/quotations/view-${q.id}`)}>
                  <TableCell className="font-bold text-primary">{q.quotationNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{q.customerName}</p>
                      <p className="text-xs text-muted-foreground">{q.customerAddress}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(q.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                  <TableCell className="text-right font-bold">৳{q.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-center">{statusBadge(q.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/quotations/view-${q.id}`)} title="View"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/quotations/edit-${q.id}`)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)} className="text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
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
function QuotationForm({ editId, onDone }: { editId?: string; onDone: () => void }) {
  const customers = storage.getAll<Customer>(KEYS.CUSTOMERS);
  const existing = editId ? storage.getById<Quotation>(KEYS.QUOTATIONS, editId) : null;

  const [form, setForm] = useState({
    customerId: existing?.customerId || '',
    customerName: existing?.customerName || '',
    customerAddress: existing?.customerAddress || '',
    customerPhone: existing?.customerPhone || '',
    date: existing?.date || new Date().toISOString().split('T')[0],
    quotationNumber: existing?.quotationNumber || generateDocNumber('QTS', storage.getAll<Quotation>(KEYS.QUOTATIONS).map(q => q.quotationNumber)),
    items: existing?.items || [emptyItem()],
    status: existing?.status || 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected',
    validUntil: existing?.validUntil || '',
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
    const data: Quotation = { ...form, id: editId || generateId(), totalAmount, createdAt: existing?.createdAt || new Date().toISOString() };
    if (editId) storage.update<Quotation>(KEYS.QUOTATIONS, editId, data);
    else storage.create<Quotation>(KEYS.QUOTATIONS, data);
    toast.success(editId ? 'Quotation updated' : 'Quotation created');
    onDone();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" onClick={onDone}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button><h1 className="text-2xl font-bold">{editId ? 'Edit Quotation' : 'New Quotation'}</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Quotation #</label><Input value={form.quotationNumber} onChange={(e) => setForm({ ...form, quotationNumber: e.target.value })} className="font-bold" /></div>
              <div><label className="text-sm font-medium">Date</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Select Customer (or type manually below)</label>
              <Select value={form.customerId} onValueChange={selectCustomer}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-1 gap-3">
              <div><label className="text-sm font-medium">Customer Name *</label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" /></div>
              <div><label className="text-sm font-medium">Customer Address</label><Textarea value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} placeholder="Address" rows={2} /></div>
              <div><label className="text-sm font-medium">Customer Phone</label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="Phone" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Valid Until</label><Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2"><label className="text-sm font-medium">Items</label><Button size="sm" variant="outline" onClick={() => setForm({ ...form, items: [...form.items, emptyItem()] })}><Plus className="h-3 w-3 mr-1" /> Add</Button></div>
              {form.items.map((item, i) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <Input className="col-span-5" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                  <Input className="col-span-2" type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} />
                  <Input className="col-span-2" type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  <div className="col-span-2 text-right text-sm font-medium">৳{item.total.toLocaleString()}</div>
                  <Button size="icon" variant="ghost" className="col-span-1 text-destructive" onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="text-right mt-3 text-lg font-bold" style={{ color: '#1B3A5C' }}>Total: ৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90">Save Quotation</Button>
          </CardContent>
        </Card>
        <DocumentPreview type="quotation" documentNumber={form.quotationNumber} date={form.date} customerName={form.customerName} customerAddress={form.customerAddress} customerPhone={form.customerPhone} items={form.items} totalAmount={totalAmount} notes={form.notes} />
      </div>
    </div>
  );
}

function QuotationView({ id, onBack }: { id: string; onBack: () => void }) {
  const q = storage.getById<Quotation>(KEYS.QUOTATIONS, id);
  if (!q) return <div>Not found</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 no-print">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <h1 className="text-2xl font-bold">{q.quotationNumber}</h1>
        <Badge variant="outline" className={q.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : q.status === 'rejected' ? 'bg-red-100 text-red-700' : q.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>
          {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
        </Badge>
        <Button onClick={printDocument} variant="outline"><Printer className="h-4 w-4 mr-2" /> Print / PDF</Button>
      </div>
      <DocumentPreview type="quotation" documentNumber={q.quotationNumber} date={q.date} customerName={q.customerName} customerAddress={q.customerAddress} customerPhone={q.customerPhone} items={q.items} totalAmount={q.totalAmount} notes={q.notes} />
    </div>
  );
}
