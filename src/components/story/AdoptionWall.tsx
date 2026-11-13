import React from 'react';
import { LESSON_STORIES } from '../../data/story/chapters';

interface AdoptionWallProps {
  completedLessonIds: string[];
}

export const AdoptionWall: React.FC<AdoptionWallProps> = ({ completedLessonIds }) => {
  const done = new Set(completedLessonIds);
  return (
    <div className="adoption-wall">
      {LESSON_STORIES.map((s) => {
        const adopted = done.has(s.lessonId);
        return (
          <figure key={s.animal.id} className={`polaroid ${adopted ? '' : 'waiting'}`}>
            <img
              src={s.animal.portrait}
              alt={`${s.animal.name}，${s.animal.species}`}
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="polaroid-name">{s.animal.name}</span>
              <span className="polaroid-note">{adopted ? s.newHome : `${s.lessonId} · 还在等你`}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
};
