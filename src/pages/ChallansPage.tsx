import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { storage, KEYS } from '@/utils/storage';
import { generateId, generateDocNumber } from '@/utils/documentNumbers';
import { Challan, ChallanItem, Customer } from '@/types';
import DocumentPreview, { printDocument } from '@/components/DocumentPreview';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, ArrowLeft, Search, Pencil, Printer } from 'lucide-react';

const emptyItem = (): ChallanItem => ({ id: generateId(), itemName: '', details: '', size: '', deliveryQty: 0, balanceQty: 0, unit: 'Pcs' });

export default function ChallansPage() {
  const navigate = useNavigate();
  const { action } = useParams();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [search, setSearch] = useState('');

  const load = () => setChallans(storage.getAll<Challan>(KEYS.CHALLANS));
  useEffect(() => { load(); }, [action]);

  if (action === 'new' || action?.startsWith('edit-')) {
    return <ChallanForm editId={action.startsWith('edit-') ? action.replace('edit-', '') : undefined} onDone={() => { load(); navigate('/challans'); }} />;
  }
  if (action?.startsWith('view-')) {
    return <ChallanView id={action.replace('view-', '')} onBack={() => navigate('/challans')} />;
  }

  const filtered = challans.filter(c => c.challanNumber.toLowerCase().includes(search.toLowerCase()) || c.customerName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (confirm('Delete?')) { storage.remove<Challan>(KEYS.CHALLANS, id); toast.success('Deleted'); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-foreground">Challans</h1><p className="text-muted-foreground">Manage delivery notes</p></div>
        <Button onClick={() => navigate('/challans/new')} className="bg-secondary hover:bg-secondary/90"><Plus className="h-4 w-4 mr-2" /> New Challan</Button>
      </div>
      <Card>
        <CardHeader><div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Challan #</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Order No</TableHead><TableHead>Status</TableHead><TableHead className="w-32">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No challans found</TableCell></TableRow>
              ) : filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.challanNumber}</TableCell>
                  <TableCell>{c.customerName}</TableCell>
                  <TableCell>{c.date}</TableCell>
                  <TableCell>{c.orderNo}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs ${c.status === 'delivered' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{c.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/challans/view-${c.id}`)}><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/challans/edit-${c.id}`)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

function ChallanForm({ editId, onDone }: { editId?: string; onDone: () => void }) {
  const customers = storage.getAll<Customer>(KEYS.CUSTOMERS);
  const existing = editId ? storage.getById<Challan>(KEYS.CHALLANS, editId) : null;

  const [form, setForm] = useState({
    customerId: existing?.customerId || '',
    customerName: existing?.customerName || '',
    customerAddress: existing?.customerAddress || '',
    customerPhone: existing?.customerPhone || '',
    date: existing?.date || new Date().toISOString().split('T')[0],
    challanNumber: existing?.challanNumber || generateDocNumber('CLN', storage.getAll<Challan>(KEYS.CHALLANS).map(c => c.challanNumber)),
    orderNo: existing?.orderNo || '',
    items: existing?.items || [emptyItem()],
    status: existing?.status || 'draft' as 'draft' | 'delivered',
    notes: existing?.notes || '',
  });

  const selectCustomer = (id: string) => {
    const c = customers.find(c => c.id === id);
    if (c) setForm({ ...form, customerId: c.id, customerName: c.name, customerAddress: c.address, customerPhone: c.phone });
  };

  const updateItem = (index: number, field: keyof ChallanItem, value: any) => {
    const items = [...form.items];
    (items[index] as any)[field] = value;
    setForm({ ...form, items });
  };

  const totalQuantity = form.items.reduce((s, i) => s + i.deliveryQty, 0);

  const handleSave = () => {
    if (!form.customerName) { toast.error('Select a customer'); return; }
    const data: Challan = { ...form, id: editId || generateId(), totalQuantity, createdAt: existing?.createdAt || new Date().toISOString() };
    if (editId) storage.update<Challan>(KEYS.CHALLANS, editId, data);
    else storage.create<Challan>(KEYS.CHALLANS, data);
    toast.success(editId ? 'Updated' : 'Created');
    onDone();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" onClick={onDone}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button><h1 className="text-2xl font-bold">{editId ? 'Edit Challan' : 'New Challan'}</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Challan Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Challan #</label><Input value={form.challanNumber} readOnly className="bg-muted" /></div>
              <div><label className="text-sm font-medium">Date</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Order No</label><Input value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Customer</label>
              <Select value={form.customerId} onValueChange={selectCustomer}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium">Status</label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select></div>
            <div>
              <div className="flex justify-between items-center mb-2"><label className="text-sm font-medium">Items</label><Button size="sm" variant="outline" onClick={() => setForm({ ...form, items: [...form.items, emptyItem()] })}><Plus className="h-3 w-3 mr-1" /> Add</Button></div>
              {form.items.map((item, i) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <Input className="col-span-3" placeholder="Item Name" value={item.itemName} onChange={(e) => updateItem(i, 'itemName', e.target.value)} />
                  <Input className="col-span-2" placeholder="Details" value={item.details} onChange={(e) => updateItem(i, 'details', e.target.value)} />
                  <Input className="col-span-1" placeholder="Size" value={item.size} onChange={(e) => updateItem(i, 'size', e.target.value)} />
                  <Input className="col-span-2" type="number" placeholder="Del Qty" value={item.deliveryQty} onChange={(e) => updateItem(i, 'deliveryQty', parseFloat(e.target.value) || 0)} />
                  <Input className="col-span-2" type="number" placeholder="Bal Qty" value={item.balanceQty} onChange={(e) => updateItem(i, 'balanceQty', parseFloat(e.target.value) || 0)} />
                  <Input className="col-span-1" placeholder="Unit" value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)} />
                  <Button size="icon" variant="ghost" className="col-span-1 text-destructive" onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="text-right mt-3 font-bold">Total Delivery Qty: {totalQuantity}</div>
            </div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90">Save Challan</Button>
          </CardContent>
        </Card>
        <DocumentPreview type="challan" documentNumber={form.challanNumber} date={form.date} customerName={form.customerName} customerAddress={form.customerAddress} customerPhone={form.customerPhone} challanItems={form.items} totalQuantity={totalQuantity} orderNo={form.orderNo} notes={form.notes} />
      </div>
    </div>
  );
}

function ChallanView({ id, onBack }: { id: string; onBack: () => void }) {
  const c = storage.getById<Challan>(KEYS.CHALLANS, id);
  if (!c) return <div>Not found</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 no-print"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button><h1 className="text-2xl font-bold">{c.challanNumber}</h1><Button onClick={printDocument} variant="outline"><Printer className="h-4 w-4 mr-2" /> Print</Button></div>
      <DocumentPreview type="challan" documentNumber={c.challanNumber} date={c.date} customerName={c.customerName} customerAddress={c.customerAddress} customerPhone={c.customerPhone} challanItems={c.items} totalQuantity={c.totalQuantity} orderNo={c.orderNo} notes={c.notes} />
    </div>
  );
}
