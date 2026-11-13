import React from 'react';
import type { UserAppState } from '../../types';
import { buildElasticDailyPlan } from '../../utils/storageAndPlanner';
import {
  ticketsFromPlan,
  getChapterProgress,
  getCurrentChapter,
  getAdoptedAnimals,
  getGreeting,
  StoryTicket,
} from '../../utils/story';
import { LESSON_STORIES } from '../../data/story/chapters';
import { TicketQueue } from './TicketQueue';
import { ShelterMap } from './ShelterMap';
import { AdoptionWall } from './AdoptionWall';
import { CompanionLog } from './CompanionLog';

interface ShelterHomeViewProps {
  state: UserAppState;
  onOpenTicket: (ticket: StoryTicket) => void;
}

export const ShelterHomeView: React.FC<ShelterHomeViewProps> = ({ state, onOpenTicket }) => {
  const plan = buildElasticDailyPlan(state);
  const tickets = ticketsFromPlan(plan.tasks, state);
  const progress = getChapterProgress(state.completedLessonIds);
  const current = getCurrentChapter(state.completedLessonIds);
  const adopted = getAdoptedAnimals(state.completedLessonIds);
  const waiting = LESSON_STORIES.length - adopted.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <div className="eyebrow-text">{current.title}</div>
        <h1 className="headline-xl" style={{ marginTop: '4px' }}>
          {getGreeting(new Date())}，今天也来看看它们吧
        </h1>
        <p className="tabular" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          已帮 {adopted.length} 只小动物找到家{waiting > 0 ? ` · 还有 ${waiting} 只在等你` : ' · 每一只都回家了'}
        </p>
      </header>

      <div className="grid-asymmetric">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <section className="surface-card" aria-labelledby="shelter-map-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <h2 id="shelter-map-title" className="card-title">窝窝救助站</h2>
              <span className="nav-badge">
                {progress.filter((p) => p.lit).length}/{progress.length} 个区域已点亮
              </span>
            </div>
            <ShelterMap progress={progress} currentChapterId={current.id} />
          </section>

          <section className="surface-card" aria-labelledby="companion-title">
            <h2 id="companion-title" className="card-title" style={{ marginBottom: '16px' }}>陪伴日志</h2>
            <CompanionLog log={state.companionLog} reflections={state.reflections} />
          </section>
        </div>

        <section className="surface-card" aria-labelledby="tickets-title">
          <div style={{ marginBottom: '16px' }}>
            <h2 id="tickets-title" className="card-title">今天的工单</h2>
            <p className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              按今天 {plan.effectiveMinutesBudget} 分钟安排，做多少都可以
            </p>
          </div>
          <TicketQueue tickets={tickets} onOpen={onOpenTicket} limit={3} compact />
        </section>
      </div>

      <section id="adoption-wall" className="surface-card" aria-labelledby="adoption-wall-title" style={{ scrollMarginTop: '72px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 id="adoption-wall-title" className="card-title">领养墙</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>每学完一讲，就有一只小家伙回家</span>
        </div>
        <AdoptionWall completedLessonIds={state.completedLessonIds} />
      </section>
    </div>
  );
};
