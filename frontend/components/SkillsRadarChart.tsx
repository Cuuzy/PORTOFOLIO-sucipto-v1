import { useState, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { Skill } from '~backend/profile/get_profile';
import { Badge } from '@/components/ui/badge';

interface Props {
  skills: Skill[];
}

const CATEGORY_COLORS: Record<string, string> = {
  programming: '#14b8a6',
  language: '#6366f1',
  technical: '#f59e0b',
  design: '#ec4899',
  marketing: '#10b981',
  productivity: '#8b5cf6',
  management: '#f97316',
  general: '#64748b',
};

const CATEGORY_LABELS: Record<string, string> = {
  programming: 'Programming',
  language: 'Languages',
  technical: 'Technical',
  design: 'Design',
  marketing: 'Marketing',
  productivity: 'Productivity',
  management: 'Management',
  general: 'General',
};

interface TooltipPayloadEntry {
  color: string;
  name: string;
  value: number;
  payload: { skill: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm">
        <p className="text-white font-semibold text-sm mb-1">{payload[0]?.payload?.skill}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SkillsRadarChart({ skills }: Props) {
  const categories = useMemo(() => {
    const cats = Array.from(new Set(skills.map(s => s.category)));
    return ['all', ...cats];
  }, [skills]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'all') return skills;
    return skills.filter(s => s.category === selectedCategory);
  }, [skills, selectedCategory]);

  const radarData = useMemo(() => {
    return filteredSkills.map(s => ({
      skill: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name,
      fullName: s.name,
      value: s.percentage,
      category: s.category,
    }));
  }, [filteredSkills]);

  const activeColor = selectedCategory === 'all' ? '#14b8a6' : (CATEGORY_COLORS[selectedCategory] ?? '#14b8a6');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              selectedCategory === cat
                ? 'text-white border-transparent shadow-lg scale-105'
                : 'border-gray-600/50 text-gray-400 hover:text-gray-200 hover:border-gray-500 bg-transparent'
            }`}
            style={
              selectedCategory === cat
                ? { backgroundColor: cat === 'all' ? '#14b8a6' : (CATEGORY_COLORS[cat] ?? '#14b8a6') }
                : {}
            }
          >
            {cat === 'all' ? 'All Skills' : (CATEGORY_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      <div className="w-full" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid
              stroke="#374151"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 9 }}
              tickCount={5}
            />
            <Radar
              name="Proficiency"
              dataKey="value"
              stroke={activeColor}
              fill={activeColor}
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ r: 4, fill: activeColor, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: activeColor }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filteredSkills.map(skill => (
          <div
            key={skill.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/40 hover:border-gray-600/60 transition-all duration-200"
          >
            <span className="text-gray-300 text-xs font-medium truncate mr-2">{skill.name}</span>
            <Badge
              className="text-xs px-1.5 py-0.5 shrink-0 border-0 text-white"
              style={{ backgroundColor: CATEGORY_COLORS[skill.category] ?? '#64748b' }}
            >
              {skill.percentage}%
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
