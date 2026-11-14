import React from 'react';
import {
  CheckCircle2,
  Circle,
  RefreshCw,
  ArrowRight,
  Compass,
} from 'lucide-react';
import {
  UserAppState,
  PacingMode,
  ExamWeightDomain,
} from '../types';
import { CURRICULUM_LESSONS } from '../data/curriculum';
import { BRIDGE_LESSONS } from '../data/bridgeOnboarding';
import { EXAM_QUESTIONS } from '../data/questions';
import { CODING_CHALLENGES } from '../data/challenges';
import {
  buildElasticDailyPlan,
  getPacingConfig,
} from '../utils/storageAndPlanner';
import { TicketQueue } from './story/TicketQueue';
import { ticketsFromPlan, StoryTicket } from '../utils/story';

interface ElasticPlannerViewProps {
  state: UserAppState;
  onUpdateState: (updater: (prev: UserAppState) => UserAppState) => void;
  onNavigateToLesson: (lessonId: string) => void;
  onNavigateToChallenge: (challengeId: string) => void;
  onNavigateToQuestion: (questionId: string, filterWrongOnly?: boolean) => void;
  onNavigateToFlashcards: () => void;
  onNavigateToBridge?: () => void;
  storyMode?: boolean;
  onOpenTicket?: (ticket: StoryTicket) => void;
}

const EXAM_DOMAINS: {
  domain: ExamWeightDomain;
  shortLabel: string;
  weight: number;
  desc: string;
}[] = [
  {
    domain: 'Developer Fundamentals (27%)',
    shortLabel: 'Developer Fundamentals',
    weight: 27,
    desc: '多租户与 Governor Limits、数据建模、Apex OOP、共享与 CRUD/FLS、声明式 vs 编程式',
  },
  {
    domain: 'Process Automation & Logic (28%)',
    shortLabel: 'Process Automation & Logic',
    weight: 28,
    desc: 'Trigger 与执行顺序、SOQL/SOSL/DML、异步 Apex、Flow 与 Apex 协同、Platform Events',
  },
  {
    domain: 'User Interface (25%)',
    shortLabel: 'User Interface',
    weight: 25,
    desc: 'LWC 生命周期与通信、@wire 与 refreshApex、LDS、Visualforce 基础',
  },
  {
    domain: 'Testing, Debugging & Deployment (20%)',
    shortLabel: 'Testing, Debugging & Deployment',
    weight: 20,
    desc: '@TestSetup、startTest/stopTest、Mock、75% 覆盖率、Debug Log、sf CLI 与部署',
  },
];

export const ElasticPlannerView: React.FC<ElasticPlannerViewProps> = ({
  state,
  onUpdateState,
  onNavigateToLesson,
  onNavigateToChallenge,
  onNavigateToQuestion,
  onNavigateToFlashcards,
  onNavigateToBridge,
  storyMode = false,
  onOpenTicket,
}) => {
  const plan = buildElasticDailyPlan(state);
  const pacingConfig = getPacingConfig(state.pacingMode);
  const completedBridgeCount = BRIDGE_LESSONS.filter((l) =>
    state.completedLessonIds.includes(l.id)
  ).length;

  const allQuestions = [...EXAM_QUESTIONS, ...state.customQuestions];
  const totalCorrectQuestions = Object.values(state.questionAttempts).filter(
    (a) => a.isCorrect
  ).length;
  const wrongBookCount = Object.values(state.questionAttempts).filter(
    (a) => !a.isCorrect && !a.masteredFromWrongBook
  ).length;
  const passedChallengesCount = Object.values(state.challengeSubmissions).filter(
    (s) => s.passedAllRules
  ).length;

  const readinessScore = Math.round(
    ((state.completedLessonIds.length / CURRICULUM_LESSONS.length) * 0.4 +
      (passedChallengesCount / CODING_CHALLENGES.length) * 0.3 +
      (totalCorrectQuestions / allQuestions.length) * 0.3) *
      100
  );

  const sliderPct = Math.round(((plan.effectiveMinutesBudget - 20) / (140 - 20)) * 100);

  const handleSetPacingMode = (mode: PacingMode) => {
    const cfg = getPacingConfig(mode);
    onUpdateState((prev) => ({
      ...prev,
      pacingMode: mode,
      dailyTargetMinutes: cfg.defaultMinutes,
      todayAvailableMinutesOverride: null,
    }));
  };

  const handleSliderChange = (minutes: number) => {
    onUpdateState((prev) => ({
      ...prev,
      todayAvailableMinutesOverride: minutes,
    }));
  };

  const handleRebalanceBusyDay = () => {
    onUpdateState((prev) => ({
      ...prev,
      todayAvailableMinutesOverride: 20,
      rebalancedDaysCount: prev.rebalancedDaysCount + 1,
    }));
  };

  const handleBoostToday = () => {
    onUpdateState((prev) => ({
      ...prev,
      todayAvailableMinutesOverride: 110,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Workspace Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="headline-xl">今日学习计划</h1>
          <p
            className="tabular"
            style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}
          >
            {pacingConfig.tagline} · 按当前节奏预计还需 {plan.daysRemainingToComplete} 天学完全部模块
            {state.rebalancedDaysCount > 0 ? ` · 已弹性顺延 ${state.rebalancedDaysCount} 次` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleRebalanceBusyDay}
            title="将今日任务压缩至 20 分钟轻量保温模式，其余平滑顺延"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
            <span className="tabular">忙碌顺延 · 20m</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBoostToday}
          >
            <span className="tabular">深度冲刺 · 110m</span>
          </button>
        </div>
      </div>

      {/* Compact Stage 0 Bridge Strip (ADM-201 + Programming Foundation) */}
      <div
        className="surface-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 520px', minWidth: 0 }}>
          <div style={{ marginTop: '2px', color: 'var(--text-muted)', flexShrink: 0 }}>
            <Compass size={16} strokeWidth={1.5} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                ADM 管理员 + 编程功底 · 零基础跃迁先导营
              </span>
              <span
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color:
                    completedBridgeCount === BRIDGE_LESSONS.length
                      ? 'var(--color-positive)'
                      : 'var(--text-muted)',
                }}
              >
                {completedBridgeCount}/{BRIDGE_LESSONS.length} 已完成
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              将熟悉的 ADM 配置与 SQL / React / Java 经验直接映射为 Apex、SOQL 与 LWC（Flow ↔ SQL/React ↔ Apex/LWC），覆盖 8 大转换场景、6 大多租户陷阱与 L00-1 至 L00-4 先导课。
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            className="btn-tertiary"
            onClick={() => onNavigateToLesson('L00-1')}
          >
            <span>先导第 1 课 L00-1</span>
          </button>
          {onNavigateToBridge && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateToBridge}
            >
              <span>打开三界转换器</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Compact 4-Stat Strip (Equal height, tabular figures + reference context only) */}
      <div className="grid-4">
        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="eyebrow-text">考场准备度</span>
          <div className="stat-figure">{readinessScore}%</div>
          <span className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            官方通过线 68%
          </span>
        </div>

        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="eyebrow-text">课程掌握进度</span>
          <div className="stat-figure">
            {state.completedLessonIds.length}
            <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {' '}
              / {CURRICULUM_LESSONS.length}
            </span>
          </div>
          <span className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            4 节先导破冰 + 16 节核心架构课
          </span>
        </div>

        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="eyebrow-text">实战实验通关</span>
          <div className="stat-figure">
            {passedChallengesCount}
            <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {' '}
              / {CODING_CHALLENGES.length}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Apex · SOQL · LWC 规则判题
          </span>
        </div>

        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="eyebrow-text">认证题库正确</span>
          <div className="stat-figure">
            {totalCorrectQuestions}
            <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {' '}
              / {allQuestions.length}
            </span>
          </div>
          <span className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            错题本待复盘 {wrongBookCount} 题
          </span>
        </div>
      </div>

      {/* Asymmetric Primary Split: Today's Task Queue (Left) + Official Blueprint Mastery Chart (Right) */}
      <div className="grid-asymmetric">
        {/* Left: Pacing Controls + Adaptive Task Queue */}
        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 className="card-title">今日任务队列</h2>
              <p className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                按今日 {plan.effectiveMinutesBudget} 分钟预算编排 · 共 {plan.totalPlannedMinutes} 分钟任务
              </p>
            </div>

            <div className="pill-tab-group">
              {(
                [
                  { id: 'relaxed', label: '30m' },
                  { id: 'standard', label: '60m' },
                  { id: 'intensive', label: '120m' },
                  { id: 'weekend', label: '周末' },
                ] as { id: PacingMode; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pill-tab tabular ${state.pacingMode === item.id ? 'selected' : ''}`}
                  onClick={() => handleSetPacingMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inline Duration Budget Slider */}
          <div
            className="surface-panel-inset"
            style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tabular" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                今日可用时长微调：<strong style={{ color: 'var(--text-primary)' }}>{plan.effectiveMinutesBudget} 分钟</strong>
              </span>
              {state.todayAvailableMinutesOverride !== null && (
                <button
                  type="button"
                  className="btn-tertiary"
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      todayAvailableMinutesOverride: null,
                    }))
                  }
                >
                  恢复默认档位
                </button>
              )}
            </div>
            <input
              type="range"
              min={20}
              max={140}
              step={15}
              value={plan.effectiveMinutesBudget}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              aria-label="今日可用学习时长滑块"
              style={
                {
                  width: '100%',
                  '--progress': `${sliderPct}%`,
                } as React.CSSProperties
              }
            />
            <div
              className="tabular"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>20m 保温</span>
              <span>60m 标准</span>
              <span>120m+ 冲刺</span>
            </div>
          </div>

          {/* Task Rows */}
          {storyMode && onOpenTicket ? (
            <TicketQueue tickets={ticketsFromPlan(plan.tasks, state)} onOpen={onOpenTicket} />
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(() => {
              const firstPendingId = plan.tasks.find((t) => !t.completed)?.id;
              return plan.tasks.map((task) => {
                const isUpNext = task.id === firstPendingId;
                return (
                  <div
                    key={task.id}
                    className="surface-panel-inset"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      borderColor: task.completed
                        ? 'var(--color-positive-border)'
                        : isUpNext
                        ? 'var(--border-strong)'
                        : 'var(--border-hairline)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {task.completed ? (
                          <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-positive)" />
                        ) : (
                          <Circle size={16} strokeWidth={1.5} color="var(--text-muted)" />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: '14px',
                              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: task.completed ? 'line-through' : 'none',
                            }}
                          >
                            {task.title}
                          </span>
                          <span className="nav-badge">{task.badge}</span>
                          <span className="nav-badge">{task.minutes}m</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {task.subtitle}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={isUpNext ? 'btn-primary' : 'btn-secondary'}
                      style={{ flexShrink: 0, minHeight: '32px', padding: '4px 12px' }}
                      onClick={() => {
                        if (task.type === 'lesson') onNavigateToLesson(task.targetId);
                        else if (task.type === 'challenge') onNavigateToChallenge(task.targetId);
                        else if (task.type === 'questions')
                          onNavigateToQuestion(task.targetId, wrongBookCount > 0);
                        else onNavigateToFlashcards();
                      }}
                    >
                      <span>{task.completed ? '复习' : '开始'}</span>
                      <ArrowRight size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                );
              });
            })()}
          </div>
          )}
        </div>

        {/* Right: The One Rich Visual Moment — Official Exam Blueprint Mastery & 68% Pass Line Chart */}
        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div>
              <h2 className="card-title">PD1 / PD2 考纲计分域掌握度</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                对标官方四大计分域权重与 68% 认证及格基准线
              </p>
            </div>
            <span className="nav-badge">PASS 68%</span>
          </div>

          <div className="blueprint-chart" role="img" aria-label="四大考纲计分域掌握度与 68% 及格线对比图">
            <div className="blueprint-pass-line" aria-hidden="true">
              <span className="blueprint-pass-label">68% pass</span>
            </div>

            {EXAM_DOMAINS.map((item) => {
              const domainLessons = CURRICULUM_LESSONS.filter(
                (l) => l.examDomain === item.domain
              );
              const completedInDomain = domainLessons.filter((l) =>
                state.completedLessonIds.includes(l.id)
              ).length;

              const domainQuestions = allQuestions.filter(
                (q) => q.examDomain === item.domain
              );
              const correctInDomain = domainQuestions.filter(
                (q) => state.questionAttempts[q.id]?.isCorrect
              ).length;

              const combinedScore = Math.round(
                ((completedInDomain / Math.max(1, domainLessons.length)) * 0.5 +
                  (correctInDomain / Math.max(1, domainQuestions.length)) * 0.5) *
                  100
              );

              return (
                <div key={item.domain} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.shortLabel}
                      </span>
                      <span className="nav-badge">权重 {item.weight}%</span>
                    </div>
                    <span
                      className="tabular"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color:
                          combinedScore >= 68
                            ? 'var(--color-positive)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {combinedScore}%
                    </span>
                  </div>

                  <div className="blueprint-bar-track">
                    <div
                      className={`blueprint-bar-fill ${combinedScore >= 68 ? 'passing' : ''}`}
                      style={{ width: `${Math.max(2, combinedScore)}%` }}
                    />
                  </div>

                  <div
                    className="tabular"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '8px' }}>
                      课 {completedInDomain}/{domainLessons.length} · 题 {correctInDomain}/{domainQuestions.length}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="blueprint-axis" aria-hidden="true">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full 20-Lesson Roadmap From Bridge to Architect */}
      <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 className="card-title">全景课程路线图（20 讲）</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              支持按任意顺序跳学，每讲均关联代码实战与认证真题
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="status-badge">L00 先导破冰</span>
            <span className="status-badge">L01–L04 入门筑基</span>
            <span className="status-badge">L05–L10 核心进阶</span>
            <span className="status-badge">L11–L16 架构与 PD2</span>
          </div>
        </div>

        <div className="grid-2">
          {CURRICULUM_LESSONS.map((lesson) => {
            const isCompleted = state.completedLessonIds.includes(lesson.id);
            const chPassed = lesson.linkedChallengeId
              ? state.challengeSubmissions[lesson.linkedChallengeId]?.passedAllRules
              : false;

            const stageLabel =
              lesson.stage === 'bridge'
                ? '先导破冰'
                : lesson.stage === 'beginner'
                ? '入门筑基'
                : lesson.stage === 'intermediate'
                ? '核心进阶'
                : lesson.stage === 'advanced'
                ? '高级架构'
                : 'PD2 架构';

            return (
              <div
                key={lesson.id}
                className="surface-panel-inset"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderColor: isCompleted
                    ? 'var(--color-positive-border)'
                    : 'var(--border-hairline)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`status-dot ${isCompleted ? 'positive' : ''}`} />
                      <span className="nav-badge">{lesson.id}</span>
                      <span className="status-badge">{stageLabel}</span>
                    </div>
                    <span className="nav-badge">{lesson.estimatedMinutes}m</span>
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {lesson.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {lesson.subtitle}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-hairline)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>{isCompleted ? '课程已掌握' : '待学习'}</span>
                    {lesson.linkedChallengeId && (
                      <span>{chPassed ? '实验已通过' : `实验 ${lesson.linkedChallengeId}`}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {lesson.linkedChallengeId && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '12px', minHeight: '28px' }}
                        onClick={() => onNavigateToChallenge(lesson.linkedChallengeId!)}
                      >
                        写代码
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '4px 12px', fontSize: '12px', minHeight: '28px' }}
                      onClick={() => onNavigateToLesson(lesson.id)}
                    >
                      进入课程
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
