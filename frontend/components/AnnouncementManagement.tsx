import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { Announcement } from '~backend/profile/announcements';

type AnnouncementType = 'info' | 'success' | 'warning' | 'error';

const typeOptions: { value: AnnouncementType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'info', label: 'Info', icon: <Info className="w-4 h-4" />, color: 'text-blue-400' },
  { value: 'success', label: 'Success', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' },
  { value: 'warning', label: 'Warning', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-400' },
  { value: 'error', label: 'Error', icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400' },
];

const typeBadge: Record<AnnouncementType, string> = {
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const emptyForm = {
  title: '',
  message: '',
  type: 'info' as AnnouncementType,
  is_active: true,
  is_dismissible: true,
  link_url: '',
  link_label: '',
  starts_at: '',
  ends_at: '',
};

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAnnouncements = async (retries = 2) => {
    setLoading(true);
    try {
      const res = await backend.profile.listAnnouncements();
      setAnnouncements(res.announcements);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      if (retries > 0 && (msg.includes('503') || msg.includes('Offline'))) {
        await new Promise((r) => setTimeout(r, 1500));
        return fetchAnnouncements(retries - 1);
      }
      console.error('Failed to fetch announcements:', error);
      toast({ title: 'Error', description: 'Failed to load announcements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (a: Announcement) => {
    setForm({
      title: a.title,
      message: a.message,
      type: a.type,
      is_active: a.is_active,
      is_dismissible: a.is_dismissible,
      link_url: a.link_url || '',
      link_label: a.link_label || '',
      starts_at: a.starts_at ? new Date(a.starts_at).toISOString().slice(0, 16) : '',
      ends_at: a.ends_at ? new Date(a.ends_at).toISOString().slice(0, 16) : '',
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        is_active: form.is_active,
        is_dismissible: form.is_dismissible,
        link_url: form.link_url || undefined,
        link_label: form.link_label || undefined,
        starts_at: form.starts_at || undefined,
        ends_at: form.ends_at || undefined,
      };
      if (editingId !== null) {
        await backend.profile.updateAnnouncement({ id: editingId, ...payload });
        toast({ title: 'Success', description: 'Announcement updated' });
      } else {
        await backend.profile.createAnnouncement(payload);
        toast({ title: 'Success', description: 'Announcement created' });
      }
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      toast({ title: 'Error', description: 'Failed to save announcement', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await backend.profile.deleteAnnouncement({ id });
      toast({ title: 'Success', description: 'Announcement deleted' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast({ title: 'Error', description: 'Failed to delete announcement', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (a: Announcement) => {
    try {
      await backend.profile.updateAnnouncement({
        id: a.id,
        title: a.title,
        message: a.message,
        type: a.type,
        is_active: !a.is_active,
        is_dismissible: a.is_dismissible,
        link_url: a.link_url,
        link_label: a.link_label,
        starts_at: a.starts_at ? new Date(a.starts_at).toISOString().slice(0, 16) : undefined,
        ends_at: a.ends_at ? new Date(a.ends_at).toISOString().slice(0, 16) : undefined,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  const formatDate = (d?: Date | string) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold text-lg">Announcements</h2>
          <p className="text-gray-400 text-sm">Manage notifications shown to all visitors on the site.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => fetchAnnouncements()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Announcement
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-gray-800/50 border-teal-600/40">
          <CardHeader>
            <CardTitle className="text-white text-base">
              {editingId !== null ? 'Edit Announcement' : 'New Announcement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Site Maintenance Notice"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Message</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={3}
                    placeholder="The announcement body text..."
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {typeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: opt.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          form.type === opt.value
                            ? 'border-teal-500 bg-teal-600/20 text-white'
                            : 'border-gray-600 bg-gray-700/40 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <span className={opt.color}>{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/40 rounded-lg">
                    <Label className="text-gray-300 cursor-pointer">Active (visible to visitors)</Label>
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/40 rounded-lg">
                    <Label className="text-gray-300 cursor-pointer">Dismissible by visitors</Label>
                    <Switch
                      checked={form.is_dismissible}
                      onCheckedChange={(v) => setForm({ ...form, is_dismissible: v })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Link URL (optional)</Label>
                  <Input
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Link Label (optional)</Label>
                  <Input
                    value={form.link_label}
                    onChange={(e) => setForm({ ...form, link_label: e.target.value })}
                    placeholder="Learn more"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Start Date/Time (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">End Date/Time (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                  {saving ? 'Saving...' : editingId !== null ? 'Save Changes' : 'Create Announcement'}
                </Button>
                <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No announcements yet. Create one above.</div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-semibold text-sm">{a.title}</span>
                        <Badge className={`text-xs border ${typeBadge[a.type]}`}>{a.type}</Badge>
                        {a.is_active ? (
                          <Badge className="text-xs bg-green-600/20 text-green-400 border-green-600/30">Active</Badge>
                        ) : (
                          <Badge className="text-xs bg-gray-600/30 text-gray-400 border-gray-600/40">Inactive</Badge>
                        )}
                        {!a.is_dismissible && (
                          <Badge className="text-xs bg-orange-600/20 text-orange-400 border-orange-600/30">Persistent</Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{a.message}</p>
                      {(a.starts_at || a.ends_at) && (
                        <p className="text-gray-500 text-xs mt-1">
                          {a.starts_at && `From: ${formatDate(a.starts_at)}`}
                          {a.starts_at && a.ends_at && ' · '}
                          {a.ends_at && `Until: ${formatDate(a.ends_at)}`}
                        </p>
                      )}
                      {a.link_url && (
                        <p className="text-teal-400 text-xs mt-1 truncate">{a.link_url}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(a)}
                        title={a.is_active ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all"
                      >
                        {a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => startEdit(a)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-teal-400 hover:bg-teal-600/10 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-600/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
