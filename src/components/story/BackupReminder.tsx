import React from 'react';
import { Download, FolderSync, X } from 'lucide-react';
import type { FileSyncStatus } from '../../utils/backupFile';

interface BackupReminderProps {
  daysSinceBackup: number | null;
  fileSyncStatus: FileSyncStatus;
  onDownload: () => void;
  onEnableFileSync: () => void;
  onResumeFileSync: () => void;
  onSnooze: () => void;
}

/** Compact, non-modal reminder (never blocks the page). */
export const BackupReminder: React.FC<BackupReminderProps> = ({
  daysSinceBackup,
  fileSyncStatus,
  onDownload,
  onEnableFileSync,
  onResumeFileSync,
  onSnooze,
}) => {
  const needsPermission = fileSyncStatus === 'needs-permission';
  const message = needsPermission
    ? '自动同步到本地文件已暂停，点一下就能继续。'
    : daysSinceBackup === null
    ? '你的学习记录目前只存在这个浏览器里，还没有备份过。'
    : `上次备份是 ${daysSinceBackup} 天前。学习记录只存在这个浏览器里。`;

  return (
    <div className="backup-reminder" role="status">
      <span className="backup-reminder-text">{message}</span>
      <div className="backup-reminder-actions">
        {needsPermission ? (
          <button type="button" className="btn-secondary" onClick={onResumeFileSync}>
            <FolderSync size={16} strokeWidth={1.5} />
            <span>继续自动同步</span>
          </button>
        ) : (
          <>
            <button type="button" className="btn-secondary" onClick={onDownload}>
              <Download size={16} strokeWidth={1.5} />
              <span>下载备份</span>
            </button>
            {fileSyncStatus === 'off' && (
              <button type="button" className="btn-tertiary" onClick={onEnableFileSync}>
                <FolderSync size={16} strokeWidth={1.5} />
                <span>自动同步到本地文件</span>
              </button>
            )}
          </>
        )}
        <button type="button" className="btn-tertiary" onClick={onSnooze} aria-label="7 天后再提醒">
          <X size={16} strokeWidth={1.5} />
          <span>7 天后再说</span>
        </button>
      </div>
    </div>
  );
};
