import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Eye, Users, Download, TrendingUp } from 'lucide-react';
import backend from '@/lib/backend';
import type { AnalyticsStats } from '~backend/analytics/get_stats';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await backend.analytics.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    { label: 'Total Page Views', value: stats.totalViews, icon: Eye, color: 'text-teal-400' },
    { label: 'Unique Visitors', value: stats.totalUniqueVisitors, icon: Users, color: 'text-blue-400' },
    { label: 'CV Downloads', value: stats.cvDownloads, icon: Download, color: 'text-purple-400' },
    { label: 'Days Tracked', value: stats.dailyVisitors.length, icon: TrendingUp, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                <p className="text-gray-400 text-xs mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">Daily Visitors (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dailyVisitors.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.dailyVisitors} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(v) => String(v).slice(5)}
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 6 }}
                  labelStyle={{ color: '#F9FAFB' }}
                  itemStyle={{ color: '#D1D5DB' }}
                />
                <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="totalViews"
                  name="Page Views"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  name="Unique Visitors"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">Most Visited Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topPages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stats.topPages}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="pagePath"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 6 }}
                  labelStyle={{ color: '#F9FAFB' }}
                  itemStyle={{ color: '#D1D5DB' }}
                />
                <Bar dataKey="views" name="Views" fill="#14B8A6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
