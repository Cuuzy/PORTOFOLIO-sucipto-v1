import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import backend from '~backend/client';
import type { Skill } from '~backend/profile/get_profile';
import type { SkillHistoryPoint } from '~backend/profile/get_skill_history';

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

const LEVEL_LABELS = [
  { value: 90, label: 'Expert', color: '#10b981' },
  { value: 75, label: 'Advanced', color: '#14b8a6' },
  { value: 60, label: 'Intermediate', color: '#f59e0b' },
  { value: 40, label: 'Beginner', color: '#f97316' },
];

function getLevelLabel(pct: number) {
  if (pct >= 90) return { label: 'Expert', color: '#10b981' };
  if (pct >= 75) return { label: 'Advanced', color: '#14b8a6' };
  if (pct >= 60) return { label: 'Intermediate', color: '#f59e0b' };
  if (pct >= 40) return { label: 'Beginner', color: '#f97316' };
  return { label: 'Learning', color: '#ef4444' };
}

interface ProgressionPayloadEntry {
  color: string;
  name: string;
  value: number;
}

interface ProgressionTooltipProps {
  active?: boolean;
  payload?: ProgressionPayloadEntry[];
  label?: string;
}

const ProgressionTooltip = ({ active, payload, label }: ProgressionTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm">
        <p className="text-gray-400 text-xs mb-2">{label}</p>
        {payload.map((entry, i) => {
          const level = getLevelLabel(entry.value);
          return (
            <div key={i} className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-300 text-xs">{entry.name}:</span>
              <span className="text-white font-bold text-xs">{entry.value}%</span>
              <span className="text-xs font-medium" style={{ color: level.color }}>({level.label})</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

function SkillNode({ skill, animated }: { skill: Skill; animated: boolean }) {
  const level = getLevelLabel(skill.percentage);
  const color = CATEGORY_COLORS[skill.category] ?? '#64748b';
  const radius = 36 + (skill.percentage / 100) * 20;
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference - (skill.percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg width={radius * 2} height={radius * 2} className="rotate-[-90deg]">
          <circle
            cx={radius}
            cy={radius}
            r={32}
            fill="none"
            stroke="#1f2937"
            strokeWidth={5}
          />
          <circle
            cx={radius}
            cy={radius}
            r={32}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : circumference}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <span className="text-white font-bold text-sm leading-none">{skill.percentage}%</span>
        </div>
      </div>
      <div className="text-center max-w-[80px]">
        <p className="text-gray-200 text-xs font-medium leading-tight line-clamp-2 group-hover:text-white transition-colors">
          {skill.name}
        </p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: level.color }}>
          {level.label}
        </p>
      </div>
    </div>
  );
}

export default function SkillTreeVisualization({ skills }: Props) {
  const [history, setHistory] = useState<SkillHistoryPoint[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [animated, setAnimated] = useState(false);
  const [view, setView] = useState<'tree' | 'progression'>('tree');

  useEffect(() => {
    backend.profile.getSkillHistory().then(res => {
      setHistory(res.history);
      const top3 = skills.slice(0, 3).map(s => s.name);
      setSelectedSkills(new Set(top3));
    }).catch(console.error);

    setTimeout(() => setAnimated(true), 300);
  }, [skills]);

  const categories = useMemo(() => {
    const cats: Record<string, Skill[]> = {};
    for (const skill of skills) {
      if (!cats[skill.category]) cats[skill.category] = [];
      cats[skill.category].push(skill);
    }
    return cats;
  }, [skills]);

  const progressionData = useMemo(() => {
    if (!history.length) return [];
    const dates = Array.from(new Set(history.map(h => h.recordedAt))).sort();
    return dates.map(date => {
      const point: Record<string, any> = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      };
      for (const skillName of selectedSkills) {
        const h = history.find(h => h.recordedAt === date && h.skillName === skillName);
        if (h) point[skillName] = h.percentage;
      }
      return point;
    });
  }, [history, selectedSkills]);

  const toggleSkill = (name: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size > 1) next.delete(name);
      } else {
        if (next.size < 5) next.add(name);
      }
      return next;
    });
  };

  const PROGRESSION_COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(['tree', 'progression'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              view === v
                ? 'bg-teal-500 text-white border-teal-500 shadow-lg'
                : 'border-gray-600/50 text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            {v === 'tree' ? 'Skill Tree' : 'Progression'}
          </button>
        ))}
      </div>

      {view === 'tree' && (
        <div className="space-y-6">
          {Object.entries(categories).map(([category, catSkills]) => {
            const color = CATEGORY_COLORS[category] ?? '#64748b';
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-300 text-sm font-semibold capitalize">{category}</span>
                  <div className="flex-1 h-px bg-gray-700/50 ml-2" />
                </div>
                <div className="flex flex-wrap gap-6 justify-start">
                  {catSkills
                    .sort((a, b) => b.percentage - a.percentage)
                    .map(skill => (
                      <SkillNode key={skill.id} skill={skill} animated={animated} />
                    ))}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-700/50">
            <span className="text-gray-500 text-xs">Level:</span>
            {LEVEL_LABELS.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-gray-400">{l.label} ({l.value}%+)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'progression' && (
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-xs mb-2">Select up to 5 skills to compare progression:</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => {
                const isSelected = selectedSkills.has(skill.name);
                const colorIdx = Array.from(selectedSkills).indexOf(skill.name);
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                      isSelected
                        ? 'text-white border-transparent'
                        : 'border-gray-600/50 text-gray-400 hover:text-gray-200 hover:border-gray-500 bg-transparent'
                    }`}
                    style={isSelected ? { backgroundColor: PROGRESSION_COLORS[colorIdx] ?? PROGRESSION_COLORS[0] } : {}}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ProgressionTooltip />} />
                {LEVEL_LABELS.map(l => (
                  <ReferenceLine
                    key={l.label}
                    y={l.value}
                    stroke={l.color}
                    strokeDasharray="4 4"
                    strokeOpacity={0.3}
                    label={{ value: l.label, fill: l.color, fontSize: 9, position: 'right' }}
                  />
                ))}
                {Array.from(selectedSkills).map((skillName, i) => (
                  <Line
                    key={skillName}
                    type="monotone"
                    dataKey={skillName}
                    stroke={PROGRESSION_COLORS[i] ?? PROGRESSION_COLORS[0]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PROGRESSION_COLORS[i] ?? PROGRESSION_COLORS[0], strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
