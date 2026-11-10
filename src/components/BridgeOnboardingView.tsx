import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertTriangle,
  Code2,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { UserAppState } from '../types';
import {
  BRIDGE_LESSONS,
  ROSETTA_MAPPINGS,
  CODER_MINDSET_SHIFTS,
  RosettaStoneItem,
} from '../data/bridgeOnboarding';

interface BridgeOnboardingViewProps {
  state: UserAppState;
  onNavigateToLesson: (lessonId: string) => void;
  onNavigateToChallenge: (challengeId: string) => void;
  onNavigateToQuestion: (questionId: string) => void;
}

export const BridgeOnboardingView: React.FC<BridgeOnboardingViewProps> = ({
  state,
  onNavigateToLesson,
  onNavigateToChallenge,
  onNavigateToQuestion,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'rosetta' | 'traps'>('rosetta');
  const [rosettaCategory, setRosettaCategory] = useState<
    'ALL' | RosettaStoneItem['category']
  >('ALL');

  const langMode = state.languageMode || 'bilingual';

  const filteredRosetta = ROSETTA_MAPPINGS.filter((item) =>
    rosettaCategory === 'ALL' ? true : item.category === rosettaCategory
  );

  const completedBridgeCount = BRIDGE_LESSONS.filter((l) =>
    state.completedLessonIds.includes(l.id)
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & 4-Step Bridge Lessons Strip */}
      <div className="surface-card-featured" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ maxWidth: '840px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="status-badge primary">Stage 0 先导引入阶</span>
              <span className="status-badge">背景：ADM-201 管理员认证</span>
              <span className="status-badge">背景：JS / React / Java / SQL</span>
            </div>
            <h1 className="headline-xl" style={{ marginBottom: '8px' }}>
              ADM 管理员 + 编程功底 · Salesforce 开发者思维跃迁先导营
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              无需重复学习基础变量循环，也无需重学 Object、Lookup 与 OWD 共享规则。直接将熟悉的声明式配置（Flow / Object Manager / App Builder）与通用代码范式（React / Java / SQL）映射为 Apex、SOQL 与 LWC，建立多租户架构直觉。
            </p>
          </div>

          <div
            className="surface-panel-inset"
            style={{
              minWidth: '200px',
              padding: '12px 16px',
            }}
          >
            <div className="eyebrow-text">先导 4 课完成进度</div>
            <div
              className="stat-figure"
              style={{ margin: '8px 0' }}
            >
              {completedBridgeCount}
              <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>
                {' '}
                / {BRIDGE_LESSONS.length}
              </span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${completedBridgeCount === BRIDGE_LESSONS.length ? 'success' : ''}`}
                style={{
                  width: `${Math.max(4, (completedBridgeCount / BRIDGE_LESSONS.length) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4-Step Bridge Lessons Quick Launch Bar */}
        <div className="grid-4">
          {BRIDGE_LESSONS.map((lesson, idx) => {
            const isDone = state.completedLessonIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="surface-panel-inset"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderColor: isDone
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
                    <span className="nav-badge">
                      Step {idx + 1} · {lesson.id}
                    </span>
                    {isDone ? (
                      <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-positive)" />
                    ) : (
                      <Circle size={16} strokeWidth={1.5} color="var(--text-muted)" />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {langMode === 'en-exam' ? lesson.titleEn : lesson.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {langMode === 'en-exam' ? lesson.subtitleEn : lesson.subtitle}
                  </div>
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
                  <span className="nav-badge">{lesson.estimatedMinutes}m</span>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '4px 12px', fontSize: '12px', minHeight: '28px' }}
                    onClick={() => onNavigateToLesson(lesson.id)}
                  >
                    <span>进入先导课</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pill-tab ${activeSubTab === 'rosetta' ? 'selected' : ''}`}
            onClick={() => setActiveSubTab('rosetta')}
          >
            三界罗塞塔转换器（8 大核心场景）
          </button>
          <button
            type="button"
            className={`pill-tab ${activeSubTab === 'traps' ? 'selected' : ''}`}
            onClick={() => setActiveSubTab('traps')}
          >
            传统程序员转型的 6 大多租户陷阱
          </button>
          <button
            type="button"
            className={`pill-tab ${activeSubTab === 'roadmap' ? 'selected' : ''}`}
            onClick={() => setActiveSubTab('roadmap')}
          >
            4 步破冰实操路径
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive 3-Way Rosetta Stone Translator */}
      {activeSubTab === 'rosetta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              领域筛选
            </span>
            <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'ALL', label: '全部场景 (8)' },
                  { id: 'Automation & Logic', label: 'Flow → Trigger' },
                  { id: 'Database & Query', label: 'Lookup / SQL → SOQL' },
                  { id: 'Security & Permissions', label: 'OWD / Profile → Sharing' },
                  { id: 'Frontend UI (LWC)', label: 'App Builder / React → LWC' },
                  { id: 'DevOps & Tooling', label: 'Setup → Metadata CLI' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`pill-tab ${rosettaCategory === cat.id ? 'selected' : ''}`}
                  onClick={() => setRosettaCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRosetta.map((item) => (
            <div
              key={item.id}
              className="surface-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {item.titleEn}
                  </div>
                  <h2 className="headline-md" style={{ marginTop: '4px' }}>
                    {item.titleZh}
                  </h2>
                </div>
                <span className="status-badge">{item.category}</span>
              </div>

              {/* 3-Column Comparison Grid */}
              <div className="grid-3">
                {/* World 1: ADM-201 Admin Knowledge */}
                <div
                  className="surface-panel-inset"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span className="status-badge">{item.adminWorld.badge}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.adminWorld.concept}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>ADM 配置方式：</strong>
                    {item.adminWorld.howYouDidItAsAdmin}
                  </div>
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-hairline)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>为何需要升级代码：</strong>{' '}
                    {item.adminWorld.limitationWhyCodeNeeded}
                  </div>
                </div>

                {/* World 2: General Programmer Knowledge */}
                <div
                  className="surface-panel-inset"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span className="status-badge">{item.generalCoderWorld.badge}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.generalCoderWorld.concept}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>通用编程对应范式：</strong>
                    {item.generalCoderWorld.familiarCodeOrPattern}
                  </div>
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-negative-subtle)',
                      border: '1px solid var(--color-negative-border)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <strong style={{ color: 'var(--color-negative)', fontWeight: 500 }}>跨界差异提醒：</strong>{' '}
                    {item.generalCoderWorld.salesforceDifferenceWarning}
                  </div>
                </div>

                {/* World 3: Salesforce Developer Target Code */}
                <div
                  className="surface-panel-inset"
                  style={{
                    borderColor: 'var(--color-accent-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span className="status-badge primary">{item.salesforceDevWorld.badge}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.salesforceDevWorld.concept}
                  </div>
                  <pre className="code-block" style={{ margin: 0 }}>
                    <code>{item.salesforceDevWorld.codeSnippet}</code>
                  </pre>
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-accent-subtle)',
                      borderLeft: '2px solid var(--color-accent)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <strong style={{ fontWeight: 500 }}>PD1 / PD2 考点结论：</strong>{' '}
                    {item.salesforceDevWorld.examKeyTakeaway}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: 6 Counter-Intuitive Mindset Shifts for Experienced Programmers */}
      {activeSubTab === 'traps' && (
        <div className="grid-2">
          {CODER_MINDSET_SHIFTS.map((shift) => (
            <div
              key={shift.id}
              className="surface-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {shift.titleEn}
                </div>
                <h3
                  className="card-title"
                  style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <AlertTriangle size={16} strokeWidth={1.5} color="var(--text-muted)" />
                  <span>{shift.titleZh}</span>
                </h3>
              </div>

              <div
                className="surface-panel-inset"
                style={{
                  borderColor: 'var(--color-negative-border)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-negative)', marginBottom: '4px' }}>
                  传统编程直觉 (Old Instinct)
                </div>
                <div>{shift.yourOldInstinct}</div>
              </div>

              <div
                className="surface-panel-inset"
                style={{
                  borderColor: 'var(--color-positive-border)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-positive)', marginBottom: '4px' }}>
                  Salesforce 多租户法则 (Platform Reality)
                </div>
                <div style={{ lineHeight: '20px' }}>{shift.salesforceReality}</div>
              </div>

              <pre className="code-block" style={{ margin: 0 }}>
                <code>{shift.codeProof}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Detailed 4-Step Fast-Track Onboarding Action Path */}
      {activeSubTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {BRIDGE_LESSONS.map((lesson, idx) => {
            const done = state.completedLessonIds.includes(lesson.id);
            return (
              <div key={lesson.id} className="surface-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ maxWidth: '760px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="status-badge">
                        Step {idx + 1} · {lesson.id}
                      </span>
                      <span className="status-badge">{lesson.domain}</span>
                      {done && <span className="status-badge success">已完成</span>}
                    </div>
                    <h3 className="headline-md" style={{ marginBottom: '4px' }}>
                      {lesson.title}
                    </h3>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {lesson.titleEn}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {lesson.summary}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onNavigateToLesson(lesson.id)}
                    >
                      <BookOpen size={16} strokeWidth={1.5} />
                      <span>阅读先导课</span>
                    </button>
                    {lesson.linkedChallengeId && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onNavigateToChallenge(lesson.linkedChallengeId!)}
                      >
                        <Code2 size={16} strokeWidth={1.5} />
                        <span>代码实战 ({lesson.linkedChallengeId})</span>
                      </button>
                    )}
                    {lesson.linkedQuestionIds.length > 0 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onNavigateToQuestion(lesson.linkedQuestionIds[0])}
                      >
                        <HelpCircle size={16} strokeWidth={1.5} />
                        <span>配套真题 ({lesson.linkedQuestionIds.join(', ')})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
