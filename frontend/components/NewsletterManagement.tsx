import { useEffect, useState } from 'react';
import { Users, Mail, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { NewsletterSubscriber } from '~backend/profile/newsletter';

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { toast } = useToast();

  const fetchSubscribers = async (status?: string, retries = 2) => {
    setLoading(true);
    try {
      const res = await backend.profile.listSubscribers({ status: status || undefined, limit: 100 });
      setSubscribers(res.subscribers);
      setTotal(res.total);
      setActiveCount(res.active_count);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      if (retries > 0 && (msg.includes('503') || msg.includes('Offline'))) {
        await new Promise((r) => setTimeout(r, 1500));
        return fetchSubscribers(status, retries - 1);
      }
      console.error('Failed to fetch subscribers:', error);
      toast({ title: 'Error', description: 'Failed to load subscribers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(statusFilter);
  }, [statusFilter]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-teal-600/20 rounded-xl">
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Subscribers</p>
              <p className="text-white text-2xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-white text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-600/20 rounded-xl">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unsubscribed</p>
              <p className="text-white text-2xl font-bold">{total - activeCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-400" />
              Subscribers
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1.5 text-sm"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => fetchSubscribers(statusFilter)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No subscribers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">Email</th>
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">Name</th>
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">Status</th>
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4">Subscribed</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Unsubscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="py-3 pr-4 text-white font-medium">{sub.email}</td>
                      <td className="py-3 pr-4 text-gray-300">{sub.name || <span className="text-gray-600">—</span>}</td>
                      <td className="py-3 pr-4">
                        {sub.status === 'active' ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Active</Badge>
                        ) : (
                          <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Unsubscribed</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{formatDate(sub.subscribed_at)}</td>
                      <td className="py-3 text-gray-400">
                        {sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : <span className="text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
