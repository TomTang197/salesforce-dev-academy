import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Eye,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Database,
  Terminal,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { UserAppState, CodingChallenge } from '../types';
import { CODING_CHALLENGES } from '../data/challenges';
import { MOCK_ORG_TABLES } from '../data/flashcards';
import { executeMockSoql } from '../utils/storageAndPlanner';

interface CodingLabViewProps {
  state: UserAppState;
  activeChallengeId: string;
  onSelectChallenge: (challengeId: string) => void;
  onSaveSubmission: (
    challengeId: string,
    userCode: string,
    passedAllRules: boolean,
    passedRuleIds: string[],
    viewedSolution: boolean
  ) => void;
}

export const CodingLabView: React.FC<CodingLabViewProps> = ({
  state,
  activeChallengeId,
  onSelectChallenge,
  onSaveSubmission,
}) => {
  const [labMode, setLabMode] = useState<'challenges' | 'soql-playground'>('challenges');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Apex' | 'SOQL' | 'LWC'>('ALL');

  const currentChallenge: CodingChallenge =
    CODING_CHALLENGES.find((c) => c.id === activeChallengeId) || CODING_CHALLENGES[0];

  const savedSub = state.challengeSubmissions[currentChallenge.id];
  const [code, setCode] = useState<string>(
    savedSub?.userCode || currentChallenge.starterCode
  );
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(
    Boolean(savedSub?.viewedSolution)
  );
  const [evaluationResult, setEvaluationResult] = useState<{
    hasRun: boolean;
    passedAll: boolean;
    passedIds: string[];
  }>({
    hasRun: Boolean(savedSub),
    passedAll: Boolean(savedSub?.passedAllRules),
    passedIds: savedSub?.passedRuleIds || [],
  });
  const [copiedSolution, setCopiedSolution] = useState(false);

  // Free SOQL Playground state
  const [playgroundSoql, setPlaygroundSoql] = useState<string>(
    `SELECT Id, Name, StageName, Amount, Account.Name\nFROM Opportunity\nWHERE Amount > 100000\nORDER BY Amount DESC\nLIMIT 10`
  );
  const [selectedSchemaObj, setSelectedSchemaObj] = useState<string>('Opportunity');

  useEffect(() => {
    const existing = state.challengeSubmissions[currentChallenge.id];
    setCode(existing?.userCode || currentChallenge.starterCode);
    setUnlockedHintLevel(0);
    setShowSolution(Boolean(existing?.viewedSolution));
    setEvaluationResult({
      hasRun: Boolean(existing),
      passedAll: Boolean(existing?.passedAllRules),
      passedIds: existing?.passedRuleIds || [],
    });
  }, [currentChallenge.id]);

  const filteredChallenges = CODING_CHALLENGES.filter((c) =>
    categoryFilter === 'ALL' ? true : c.category === categoryFilter
  );

  const handleRunAndValidate = () => {
    const passedIds: string[] = [];
    for (const rule of currentChallenge.acceptanceRules) {
      const allMatched = rule.mustMatch.every((pattern) => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(code);
      });
      const noneForbidden = (rule.mustNotMatch || []).every((pattern) => {
        const regex = new RegExp(pattern, 'i');
        return !regex.test(code);
      });
      if (allMatched && noneForbidden) {
        passedIds.push(rule.id);
      }
    }

    const passedAll = passedIds.length === currentChallenge.acceptanceRules.length;
    setEvaluationResult({
      hasRun: true,
      passedAll,
      passedIds,
    });
    onSaveSubmission(
      currentChallenge.id,
      code,
      passedAll,
      passedIds,
      showSolution
    );
  };

  const handleApplyReferenceSolution = () => {
    setCode(currentChallenge.referenceSolution);
    setShowSolution(true);
    const allIds = currentChallenge.acceptanceRules.map((r) => r.id);
    setEvaluationResult({
      hasRun: true,
      passedAll: true,
      passedIds: allIds,
    });
    onSaveSubmission(
      currentChallenge.id,
      currentChallenge.referenceSolution,
      true,
      allIds,
      true
    );
  };

  const handleCopySolution = () => {
    navigator.clipboard?.writeText(currentChallenge.referenceSolution);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 1800);
  };

  const playgroundResult = executeMockSoql(playgroundSoql);
  const cleanPlanCost = playgroundResult.queryPlanCost.replace(/[^\x00-\x7F\u4e00-\u9fa5\s.,:()/<>=-]/g, '').trim();
  const isOptimalPlan = playgroundResult.queryPlanCost.toLowerCase().includes('index') || playgroundResult.queryPlanCost.includes('0.1') || playgroundResult.queryPlanCost.includes('0.2');
  const activeSchema =
    MOCK_ORG_TABLES.find((t) => t.objectName === selectedSchemaObj) ||
    MOCK_ORG_TABLES[0];

  const passedTotal = Object.values(state.challengeSubmissions).filter(
    (s) => s.passedAllRules
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="pill-tab-group">
          <button
            type="button"
            className={`pill-tab ${labMode === 'challenges' ? 'selected' : ''}`}
            onClick={() => setLabMode('challenges')}
          >
            实战编程题库（16 题）
          </button>
          <button
            type="button"
            className={`pill-tab ${labMode === 'soql-playground' ? 'selected' : ''}`}
            onClick={() => setLabMode('soql-playground')}
          >
            SOQL 查询沙盒与对象字典
          </button>
        </div>

        <span className="nav-badge">
          已通过 {passedTotal} / {CODING_CHALLENGES.length}
        </span>
      </div>

      {labMode === 'challenges' ? (
        <div className="grid-sidebar-split">
          {/* Left Challenge Selector */}
          <div className="surface-card" style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="card-title">编程题列表</h2>
              <div className="pill-tab-group" style={{ flexWrap: 'wrap' }}>
                {(['ALL', 'Apex', 'SOQL', 'LWC'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`pill-tab ${categoryFilter === cat ? 'selected' : ''}`}
                    style={{ padding: '4px 10px' }}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat === 'ALL' ? '全部' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '72vh',
                overflowY: 'auto',
              }}
            >
              {filteredChallenges.map((ch) => {
                const passed = state.challengeSubmissions[ch.id]?.passedAllRules;
                const active = ch.id === currentChallenge.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    className={`nav-item-btn ${active ? 'active' : ''}`}
                    onClick={() => onSelectChallenge(ch.id)}
                    style={{ alignItems: 'flex-start', padding: '8px 12px' }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: 0 }}>
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {passed ? (
                          <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-positive)" />
                        ) : (
                          <Code2 size={16} strokeWidth={1.5} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="nav-badge">{ch.id}</span>
                          <span className="nav-badge">{ch.category}</span>
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: active ? 500 : 400,
                            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                            marginTop: '4px',
                          }}
                        >
                          {state.languageMode === 'en-exam' ? ch.titleEn || ch.title : ch.title}
                        </div>
                        {state.languageMode === 'bilingual' && ch.titleEn && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {ch.titleEn}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Coding Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {/* Scenario & Task Spec */}
            <div className="surface-card-featured">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="status-badge primary">
                    {currentChallenge.id} · {currentChallenge.category}
                  </span>
                  <span className="status-badge">{currentChallenge.domain}</span>
                  <span className="status-badge">{currentChallenge.estimatedMinutes}m</span>
                </div>
                {evaluationResult.passedAll && (
                  <span className="status-badge success">
                    <CheckCircle2 size={16} strokeWidth={1.5} />
                    <span>全部检查点通过</span>
                  </span>
                )}
              </div>

              {state.languageMode !== 'zh' && currentChallenge.titleEn && (
                <div
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  {currentChallenge.titleEn}
                </div>
              )}
              <h1 className="headline-md" style={{ marginBottom: '12px' }}>
                {state.languageMode === 'en-exam'
                  ? currentChallenge.titleEn || currentChallenge.title
                  : currentChallenge.title}
              </h1>
              {state.languageMode !== 'zh' && currentChallenge.scenarioEn && (
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '8px' }}>
                  <span className="lang-tag">EN</span>
                  {currentChallenge.scenarioEn}
                </p>
              )}
              {state.languageMode !== 'en-exam' && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                  <span className="lang-tag">ZH</span>
                  {currentChallenge.scenario}
                </p>
              )}

              <div className="surface-panel-inset">
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  验收标准 (Acceptance Criteria)
                </div>
                <ul
                  style={{
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {currentChallenge.taskRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Code Editor + Toolbar */}
            <div className="surface-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={16} strokeWidth={1.5} color="var(--text-muted)" />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    代码编辑器 · {currentChallenge.category}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      setUnlockedHintLevel((prev) => Math.min(3, prev + 1))
                    }
                  >
                    <Lightbulb size={16} strokeWidth={1.5} />
                    <span className="tabular">提示 {unlockedHintLevel}/3</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowSolution((prev) => !prev)}
                  >
                    <Eye size={16} strokeWidth={1.5} />
                    <span>{showSolution ? '隐藏参考答案' : '查看参考答案'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCode(currentChallenge.starterCode)}
                  >
                    <RotateCcw size={16} strokeWidth={1.5} />
                    <span>重置</span>
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleRunAndValidate}
                  >
                    <Play size={16} strokeWidth={1.5} />
                    <span>运行判题</span>
                    <kbd className="keycap" style={{ backgroundColor: 'rgba(15, 15, 16, 0.14)', color: 'inherit', borderColor: 'rgba(15, 15, 16, 0.2)', boxShadow: 'none' }}>
                      ⌘↵
                    </kbd>
                  </button>
                </div>
              </div>

              {/* Progressive Hints Drawer */}
              {unlockedHintLevel > 0 && (
                <div
                  className="surface-panel-inset"
                  style={{
                    marginBottom: '12px',
                    borderColor: 'var(--color-warning-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-warning)' }}>
                    阶梯思路提示 ({unlockedHintLevel}/3)
                  </div>
                  {currentChallenge.hints.slice(0, unlockedHintLevel).map((h, i) => (
                    <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>提示 {i + 1}：</strong> {h}
                    </div>
                  ))}
                </div>
              )}

              <textarea
                className="code-editor-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleRunAndValidate();
                  }
                }}
                spellCheck={false}
                aria-label="代码编辑区"
              />

              {/* Automated Checkpoints Result */}
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span className="tabular" style={{ fontSize: '13px', fontWeight: 500 }}>
                    判题检查点 ({evaluationResult.passedIds.length}/
                    {currentChallenge.acceptanceRules.length})
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {currentChallenge.governorLimitImpact}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentChallenge.acceptanceRules.map((rule) => {
                    const passed = evaluationResult.passedIds.includes(rule.id);
                    return (
                      <div
                        key={rule.id}
                        className="surface-panel-inset"
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          borderColor: evaluationResult.hasRun
                            ? passed
                              ? 'var(--color-positive-border)'
                              : 'var(--color-negative-border)'
                            : 'var(--border-hairline)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {evaluationResult.hasRun ? (
                            passed ? (
                              <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-positive)" />
                            ) : (
                              <XCircle size={16} strokeWidth={1.5} color="var(--color-negative)" />
                            )
                          ) : (
                            <Code2 size={16} strokeWidth={1.5} color="var(--text-muted)" />
                          )}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>
                              {rule.label}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              检测规则：{rule.description}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`status-badge ${
                            !evaluationResult.hasRun
                              ? ''
                              : passed
                              ? 'success'
                              : 'danger'
                          }`}
                        >
                          {!evaluationResult.hasRun
                            ? '待运行'
                            : passed
                            ? '通过'
                            : '未匹配'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Execution Output */}
              {evaluationResult.hasRun && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                    模拟运行输出与 Governor Limits 指标
                  </div>
                  {currentChallenge.mockOutputPreview.type === 'table' &&
                    currentChallenge.mockOutputPreview.columns &&
                    currentChallenge.mockOutputPreview.rows && (
                      <div className="data-table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              {currentChallenge.mockOutputPreview.columns.map((col) => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentChallenge.mockOutputPreview.rows.map((row, idx) => (
                              <tr key={idx}>
                                {currentChallenge.mockOutputPreview.columns!.map((col) => (
                                  <td key={col}>{String(row[col] ?? '')}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {currentChallenge.mockOutputPreview.type === 'logs' &&
                    currentChallenge.mockOutputPreview.logs && (
                      <pre className="code-block">
                        <code>{currentChallenge.mockOutputPreview.logs.join('\n')}</code>
                      </pre>
                    )}

                  {currentChallenge.mockOutputPreview.type === 'lwc-preview' && (
                    <div
                      className="surface-panel-inset"
                      style={{ borderColor: 'var(--color-accent-border)', color: 'var(--text-primary)' }}
                    >
                      <strong style={{ fontWeight: 500 }}>LWC 组件渲染预览：</strong>{' '}
                      {currentChallenge.mockOutputPreview.componentSummary}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Full Reference Solution & Line-by-Line Walkthrough */}
            {showSolution && (
              <div className="surface-card-featured">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div className="eyebrow-text" style={{ marginBottom: '4px' }}>
                      标准参考答案与逐行解析
                    </div>
                    <h2 className="card-title">参考实现与 Governor Limit 复杂度剖析</h2>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCopySolution}
                    >
                      {copiedSolution ? (
                        <Check size={16} strokeWidth={1.5} />
                      ) : (
                        <Copy size={16} strokeWidth={1.5} />
                      )}
                      <span>{copiedSolution ? '已复制' : '复制答案'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleApplyReferenceSolution}
                    >
                      填入编辑器并判题
                    </button>
                  </div>
                </div>

                <pre className="code-block" style={{ marginBottom: '16px' }}>
                  <code>{currentChallenge.referenceSolution}</code>
                </pre>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>
                    关键代码逐行拆解
                  </div>
                  {currentChallenge.solutionWalkthrough.map((item, idx) => (
                    <div key={idx} className="surface-panel-inset">
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        {item.lineOrBlock}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mode 2: Free SOQL Live Playground & Mock Org Schema Explorer */
        <div className="grid-sidebar-split">
          <div className="surface-card" style={{ padding: '16px' }}>
            <h2
              className="card-title"
              style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Database size={16} strokeWidth={1.5} color="var(--text-muted)" />
              <span>模拟 Org 对象 Schema</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              查看标准与自定义对象字段及索引状态（Indexed）
            </p>

            <div className="pill-tab-group" style={{ flexWrap: 'wrap', marginBottom: '12px' }}>
              {MOCK_ORG_TABLES.map((t) => (
                <button
                  key={t.objectName}
                  type="button"
                  className={`pill-tab ${selectedSchemaObj === t.objectName ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSchemaObj(t.objectName);
                    const fieldNames = t.fields.map((f) => f.name).join(', ');
                    setPlaygroundSoql(`SELECT ${fieldNames}\nFROM ${t.objectName}\nLIMIT 10`);
                  }}
                >
                  {t.objectName}
                </button>
              ))}
            </div>

            <div className="surface-panel-inset" style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 500, fontSize: '13px' }}>{activeSchema.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activeSchema.description}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeSchema.fields.map((f) => (
                <div
                  key={f.name}
                  className="surface-panel-inset"
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500 }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {f.type} {f.note ? `· ${f.note}` : ''}
                    </div>
                  </div>
                  {f.indexed && (
                    <span className="status-badge success">Indexed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            <div className="surface-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <h2 className="card-title">实时 SOQL 查询与 Query Plan 索引分析器</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    支持测试 WHERE 过滤、ORDER BY、LIMIT 以及前导通配符与不等号索引失效检测
                  </p>
                </div>
                <span className={`status-badge ${isOptimalPlan ? 'success' : 'warning'}`}>
                  Query Plan: {cleanPlanCost || playgroundResult.queryPlanCost}
                </span>
              </div>

              <textarea
                className="code-editor-textarea"
                style={{ minHeight: '140px' }}
                value={playgroundSoql}
                onChange={(e) => setPlaygroundSoql(e.target.value)}
                spellCheck={false}
              />

              <div
                className="surface-panel-inset"
                style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}
              >
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Query Plan 诊断：</strong>{' '}
                {playgroundResult.selectivityNote}
              </div>

              {playgroundResult.error ? (
                <div
                  className="surface-panel-inset"
                  style={{
                    marginTop: '12px',
                    borderColor: 'var(--color-negative-border)',
                    color: 'var(--color-negative)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                >
                  {playgroundResult.error}
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <div className="tabular" style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                    查询结果（{playgroundResult.rows.length} rows · {playgroundResult.objectName}）
                  </div>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {playgroundResult.columns.map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {playgroundResult.rows.map((row, idx) => (
                          <tr key={idx}>
                            {playgroundResult.columns.map((col) => (
                              <td key={col}>{String(row[col] ?? '-')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
