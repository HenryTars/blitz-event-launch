'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await authFetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) setSettings(data.settings || {});
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const res = await authFetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    const data = await res.json();
    if (res.ok) setMessage('Settings saved');
    else setMessage(data.error || 'Save failed');
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Platform configuration</p>
      </div>

      {message && <div className="mb-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-2 text-sm text-gold">{message}</div>}

      <div className="max-w-lg space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-slate-400">{key}</label>
            <input
              value={value}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/40 focus:outline-none"
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-gold/90 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
