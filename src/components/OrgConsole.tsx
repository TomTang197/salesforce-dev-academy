import React, { useCallback, useEffect, useState } from 'react';
import { Database, Play, RefreshCw, Terminal } from 'lucide-react';
import {
  getBridgeStatus,
  runOrgSoql,
  runOrgApex,
  flattenRecord,
  BridgeStatus,
  SoqlResult,
  ApexResult,
  BridgeError,
} from '../utils/orgBridge';

const DEFAULT_SOQL = 'SELECT Id, Name, Industry, CreatedDate\nFROM Account\nORDER BY CreatedDate DESC\nLIMIT 10';
const DEFAULT_APEX = `List<Account> accts = [SELECT Id, Name FROM Account LIMIT 5];
System.debug('查询到 ' + accts.size() + ' 个 Account');
for (Account a : accts) {
    System.debug(a.Name);
}
System.debug('已用 SOQL 次数: ' + Limits.getQueries() + ' / ' + Limits.getLimitQueries());`;

const SETUP_STEPS = [
  { label: '1. 注册免费的 Developer Edition org', cmd: 'https://developer.salesforce.com/signup' },
  { label: '2. 安装 Salesforce CLI', cmd: 'npm install -g @salesforce/cli' },
  { label: '3. 浏览器登录并起别名 forcecraft', cmd: 'sf org login web --alias forcecraft' },
  { label: '4. 在项目目录启动连接桥（保持窗口打开）', cmd: 'cd /Users/tom/Tom-CV/salesforce-dev-academy && npm run org-bridge' },
];

export const OrgConsole: React.FC = () => {
  const [status, setStatus] = useState<BridgeStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [soql, setSoql] = useState(DEFAULT_SOQL);
  const [apex, setApex] = useState(DEFAULT_APEX);
  const [soqlResult, setSoqlResult] = useState<SoqlResult | BridgeError | null>(null);
  const [apexResult, setApexResult] = useState<ApexResult | BridgeError | null>(null);
  const [running, setRunning] = useState<'soql' | 'apex' | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    setStatus(await getBridgeStatus());
    setChecking(false);
  }, []);

  // The user explicitly opened this tab, so contacting the local bridge is user-initiated.
  useEffect(() => {
    check();
  }, [check]);

  const connected = status?.state === 'connected';

  const handleRunSoql = async () => {
    setRunning('soql');
    setSoqlResult(await runOrgSoql(soql));
    setRunning(null);
  };

  const handleRunApex = async () => {
    setRunning('apex');
    setApexResult(await runOrgApex(apex));
    setRunning(null);
  };

  const rows = soqlResult && soqlResult.ok ? soqlResult.records.map((r) => flattenRecord(r)) : [];
  const columns = rows.length ? Array.from(new Set(rows.flatMap((r) => Object.keys(r)))) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Connection status */}
      <div className="surface-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 className="card-title">在你自己的 Developer Org 里真实运行</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {status === null || checking
              ? '正在检测本地连接桥…'
              : status.state === 'connected'
              ? `已连接 ${status.org.username} · ${status.org.instanceUrl}`
              : status.state === 'offline'
              ? '没有检测到本地连接桥。按下面 4 步完成一次性设置。'
              : `连接桥已启动，但 org 不可用：${status.message || status.error}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-dot ${connected ? 'positive' : ''}`} aria-hidden="true" />
          <button type="button" className="btn-secondary" onClick={check} disabled={checking}>
            <RefreshCw size={16} strokeWidth={1.5} />
            <span>重新检测</span>
          </button>
        </div>
      </div>

      {!connected && status !== null && !checking && (
        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="card-title">一次性设置</h3>
          {SETUP_STEPS.map((step) => (
            <div key={step.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{step.label}</span>
              <code style={{ padding: '8px 12px', display: 'block', userSelect: 'all' }}>{step.cmd}</code>
            </div>
          ))}
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            连接桥只监听本机 127.0.0.1，并且只接受来自 ForceCraft 页面的请求。匿名 Apex 会在 org 中真实执行，请只连接
            Developer Edition 或 scratch org，不要连接生产环境。
          </p>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start', opacity: connected ? 1 : 0.5 }}>
        {/* SOQL */}
        <section className="surface-card" aria-labelledby="org-soql-title" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 id="org-soql-title" className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} strokeWidth={1.5} color="var(--text-muted)" />
              <span>真实 SOQL 查询</span>
            </h3>
            <button type="button" className="btn-primary" disabled={!connected || running !== null} onClick={handleRunSoql}>
              <Play size={16} strokeWidth={1.5} />
              <span>{running === 'soql' ? '查询中…' : '运行查询'}</span>
            </button>
          </div>
          <textarea
            className="code-editor-textarea"
            style={{ minHeight: '140px' }}
            value={soql}
            onChange={(e) => setSoql(e.target.value)}
            spellCheck={false}
            aria-label="SOQL 查询"
          />
          {soqlResult && !soqlResult.ok && (
            <div className="surface-panel-inset" style={{ borderColor: 'var(--color-negative-border)', color: 'var(--color-negative)', fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {soqlResult.message || soqlResult.error}
            </div>
          )}
          {soqlResult && soqlResult.ok && (
            <>
              <span className="nav-badge">共 {soqlResult.totalSize} 条 · 显示 {rows.length} 条</span>
              {rows.length > 0 && (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          {columns.map((c) => (
                            <td key={c}>{r[c] ?? ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        {/* Anonymous Apex */}
        <section className="surface-card" aria-labelledby="org-apex-title" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 id="org-apex-title" className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} strokeWidth={1.5} color="var(--text-muted)" />
              <span>匿名 Apex（Execute Anonymous）</span>
            </h3>
            <button type="button" className="btn-primary" disabled={!connected || running !== null} onClick={handleRunApex}>
              <Play size={16} strokeWidth={1.5} />
              <span>{running === 'apex' ? '执行中…' : '执行'}</span>
            </button>
          </div>
          <textarea
            className="code-editor-textarea"
            style={{ minHeight: '140px' }}
            value={apex}
            onChange={(e) => setApex(e.target.value)}
            spellCheck={false}
            aria-label="匿名 Apex 代码"
          />
          {apexResult && !apexResult.ok && (
            <div className="surface-panel-inset" style={{ borderColor: 'var(--color-negative-border)', color: 'var(--color-negative)', fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {apexResult.message || apexResult.error}
            </div>
          )}
          {apexResult && apexResult.ok && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className={`status-badge ${apexResult.success ? 'success' : 'danger'}`} style={{ alignSelf: 'flex-start' }}>
                {!apexResult.compiled ? '编译失败' : apexResult.success ? '执行成功' : '运行时异常'}
              </span>
              {(apexResult.compileProblem || apexResult.exceptionMessage) && (
                <pre className="code-block" style={{ color: 'var(--color-negative)' }}>
                  <code>
                    {apexResult.compileProblem
                      ? `第 ${apexResult.line} 行第 ${apexResult.column} 列：${apexResult.compileProblem}`
                      : `${apexResult.exceptionMessage}\n${apexResult.exceptionStackTrace ?? ''}`}
                  </code>
                </pre>
              )}
              {apexResult.debugLines.length > 0 && (
                <pre className="code-block">
                  <code>{apexResult.debugLines.join('\n')}</code>
                </pre>
              )}
              {apexResult.limitLines.length > 0 && (
                <pre className="code-block" style={{ color: 'var(--text-muted)' }}>
                  <code>{apexResult.limitLines.join('\n')}</code>
                </pre>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
