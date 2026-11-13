import React, { useEffect, useRef, useState } from 'react';
import type { Mood } from '../../types';
import { MOOD_OPTIONS } from '../../data/story/moods';
import { CHARACTERS } from '../../data/story/characters';
import { useLightDismissFallback } from '../../utils/useLightDismissFallback';

interface MoodCheckInDialogProps {
  open: boolean;
  onChoose: (mood: Mood) => void;
  onClose: (mood: Mood | null) => void;
}

export const MoodCheckInDialog: React.FC<MoodCheckInDialogProps> = ({ open, onChoose, onClose }) => {
  const ref = useRef<HTMLDialogElement | null>(null);
  const chosenRef = useRef<Mood | null>(null);
  const [chosen, setChosen] = useState<Mood | null>(null);
  useLightDismissFallback(ref);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose(chosenRef.current);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const option = MOOD_OPTIONS.find((o) => o.mood === chosen);
  const speaker = option ? CHARACTERS[option.speakerId] : null;

  return (
    <dialog
      ref={ref}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      className="linear-dialog"
      aria-labelledby="moodDialogTitle"
      style={{ maxWidth: '480px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 id="moodDialogTitle" className="headline-md">今天的你，状态怎么样？</h2>
        <button type="button" className="btn-tertiary" onClick={() => ref.current?.close()}>
          <span>跳过</span>
          <kbd className="keycap">Esc</kbd>
        </button>
      </div>

      {!option || !speaker ? (
        <>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            选一个就好，没有对错。今天的工单会跟着你调整。
          </p>
          <div className="mood-grid">
            {MOOD_OPTIONS.map((o) => (
              <button
                key={o.mood}
                type="button"
                className="mood-option"
                onClick={() => {
                  chosenRef.current = o.mood;
                  setChosen(o.mood);
                  onChoose(o.mood);
                }}
              >
                <span className="mood-option-label">{o.label}</span>
                <span className="mood-option-hint">{o.hint}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span className="avatar-initial" aria-hidden="true">{speaker.initial}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {speaker.name} · {speaker.role}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px' }}>{option.reply}</p>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => ref.current?.close()}>
            好
          </button>
        </div>
      )}
    </dialog>
  );
};
