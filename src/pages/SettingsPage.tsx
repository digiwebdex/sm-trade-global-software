import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/utils/storage';
import { CompanySettings } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>(storage.getSettings());

  if (!isAdmin) return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;

  const handleSave = () => {
    storage.saveSettings(settings);
    toast.success('Company settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
        <p className="text-muted-foreground">Configure your company details for documents</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium">Company Name</label><Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Tagline</label><Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Address</label><Textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Phone</label><Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Email</label><Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></div>
          </div>
          <div><label className="text-sm font-medium">Website</label><Input value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} /></div>
          <Button onClick={handleSave} className="bg-secondary hover:bg-secondary/90"><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
