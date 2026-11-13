import React from 'react';
import type { CompanionLogEntry } from '../../types';
import { getLessonStory, toDateKey } from '../../utils/story';

interface CompanionLogProps {
  log: Record<string, CompanionLogEntry>;
  reflections: Record<string, string>;
}

const DAYS = 84;

export const CompanionLog: React.FC<CompanionLogProps> = ({ log, reflections }) => {
  const today = new Date();
  const todayKey = toDateKey(today);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1));
  const padding = (start.getDay() + 6) % 7;
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = toDateKey(d);
    return { key, entry: log[key] };
  });

  const visitedDays = Object.keys(log).length;
  const totalMinutes = Object.values(log).reduce((sum, e) => sum + e.minutes, 0);
  const recentReflections = Object.entries(reflections)
    .filter(([, text]) => text.trim())
    .slice(-3)
    .reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
        <div className="companion-grid" role="img" aria-label={`最近 12 周陪伴过 ${visitedDays} 天`}>
          {Array.from({ length: padding }, (_, i) => (
            <span key={`pad-${i}`} className="companion-dot pad" />
          ))}
          {days.map(({ key, entry }) => (
            <span
              key={key}
              title={entry ? `${key} · ${entry.minutes} 分钟` : key}
              className={`companion-dot ${entry ? 'visited' : ''} ${entry && entry.minutes < 20 ? 'light' : ''} ${key === todayKey ? 'today' : ''}`}
            />
          ))}
        </div>
        <p className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          陪伴过 {visitedDays} 天 · 共 {totalMinutes} 分钟
          <br />
          中途停下也没关系，这里只记得你来过。
        </p>
      </div>

      {recentReflections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentReflections.map(([lessonId, text]) => (
            <div key={lessonId} className="story-quote">
              <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>
                写给{getLessonStory(lessonId)?.animal.name ?? lessonId}
              </span>
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
