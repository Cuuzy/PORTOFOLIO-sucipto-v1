import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { Availability, AvailabilityStatus } from '~backend/profile/availability';

export default function AvailabilityManagement() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [status, setStatus] = useState<AvailabilityStatus>('available');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await backend.profile.getAvailability();
        setAvailability(data);
        setStatus(data.status);
        setMessage(data.message ?? '');
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await backend.profile.updateAvailability({ status, message: message || undefined });
      setAvailability(data);
      toast({ title: 'Success', description: 'Availability updated successfully' });
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast({ title: 'Error', description: 'Failed to update availability', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const statusConfig = {
    available: { label: 'Available', color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
    busy: { label: 'Busy', color: 'text-yellow-400', dot: 'bg-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
    unavailable: { label: 'Unavailable', color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  };

  const current = statusConfig[status];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Availability Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Current preview:</span>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${current.bg} ${current.color}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${current.dot}`} />
              <span>{current.label}</span>
              {message && <span className="text-xs opacity-75">· {message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as AvailabilityStatus)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="available" className="text-emerald-400">Available</SelectItem>
                <SelectItem value="busy" className="text-yellow-400">Busy</SelectItem>
                <SelectItem value="unavailable" className="text-red-400">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Open to new opportunities, Currently on a project..."
              className="bg-gray-700 border-gray-600 text-white resize-none"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>

          {availability && (
            <p className="text-gray-500 text-xs">
              Last updated: {new Date(availability.updatedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
