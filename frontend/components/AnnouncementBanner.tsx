import { useEffect, useState } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import backend from '~backend/client';
import type { Announcement } from '~backend/profile/announcements';

const DISMISSED_KEY = 'dismissed_announcements';

function getDismissed(): Set<number> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(set: Set<number>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

const typeConfig = {
  info: {
    bg: 'bg-blue-600/15 border-blue-500/40',
    icon: <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />,
    bar: 'bg-blue-500',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  success: {
    bg: 'bg-green-600/15 border-green-500/40',
    icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />,
    bar: 'bg-green-500',
    badge: 'bg-green-500/20 text-green-300',
  },
  warning: {
    bg: 'bg-yellow-600/15 border-yellow-500/40',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />,
    bar: 'bg-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-300',
  },
  error: {
    bg: 'bg-red-600/15 border-red-500/40',
    icon: <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />,
    bar: 'bg-red-500',
    badge: 'bg-red-500/20 text-red-300',
  },
};

function AnnouncementItem({
  announcement,
  onDismiss,
}: {
  announcement: Announcement;
  onDismiss: (id: number) => void;
}) {
  const cfg = typeConfig[announcement.type] ?? typeConfig.info;

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg ${cfg.bg} animate-in slide-in-from-top duration-400`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${cfg.bar}`} />
      <div className="pl-2 flex items-start gap-3 flex-1 min-w-0">
        {cfg.icon}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-snug">{announcement.title}</p>
          <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{announcement.message}</p>
          {announcement.link_url && (
            <a
              href={announcement.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              {announcement.link_label || 'Learn more'}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {announcement.is_dismissible && (
        <button
          onClick={() => onDismiss(announcement.id)}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0 mt-0.5"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(getDismissed);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await backend.profile.getActiveAnnouncements();
        setAnnouncements(res.announcements);
      } catch {
      }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: number) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2">
      {visible.length > 1 && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Show {visible.length} notifications
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Collapse
            </>
          )}
        </button>
      )}
      {!collapsed &&
        visible.map((a) => (
          <AnnouncementItem key={a.id} announcement={a} onDismiss={handleDismiss} />
        ))}
      {collapsed && visible.length > 0 && (
        <AnnouncementItem key={visible[0].id} announcement={visible[0]} onDismiss={handleDismiss} />
      )}
    </div>
  );
}
