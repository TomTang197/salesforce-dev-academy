import React from 'react';
import type { ChapterProgress } from '../../utils/story';

interface ShelterMapProps {
  progress: ChapterProgress[];
  currentChapterId: string;
}

export const ShelterMap: React.FC<ShelterMapProps> = ({ progress, currentChapterId }) => (
  <div className="shelter-map" role="list" aria-label="救助站平面图">
    {progress.map((p) => {
      const isCurrent = p.chapter.id === currentChapterId && !p.lit;
      const status = p.lit ? '已点亮' : isCurrent ? `进行中 ${p.completed}/${p.total}` : `${p.completed}/${p.total}`;
      return (
        <div
          key={p.chapter.id}
          role="listitem"
          className={`shelter-area ${p.lit ? 'lit' : ''} ${isCurrent ? 'current' : ''}`}
          style={{ gridArea: p.chapter.area }}
          aria-label={`${p.chapter.areaLabel}，${p.chapter.title}，${status}`}
        >
          <span className="shelter-area-lamp" aria-hidden="true" />
          <div>
            <div className="shelter-area-label">{p.chapter.areaLabel}</div>
            <div className="shelter-area-chapter">{p.chapter.title}</div>
          </div>
          <span className="nav-badge">{status}</span>
        </div>
      );
    })}
  </div>
);
