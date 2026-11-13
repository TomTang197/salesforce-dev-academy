import React, { useEffect, useRef, useState } from 'react';
import type { LessonStory } from '../../data/story/chapters';
import { STORY_CHAPTERS } from '../../data/story/chapters';
import { useLightDismissFallback } from '../../utils/useLightDismissFallback';

interface StoryUnlockDialogProps {
  story: LessonStory | null;
  reflection: string;
  onSaveReflection: (text: string) => void;
  onClose: () => void;
}

export const StoryUnlockDialog: React.FC<StoryUnlockDialogProps> = ({ story, reflection, onSaveReflection, onClose }) => {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [text, setText] = useState(reflection);
  useLightDismissFallback(ref);

  useEffect(() => {
    setText(reflection);
  }, [story?.lessonId, reflection]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (story && !dialog.open) dialog.showModal();
    if (!story && dialog.open) dialog.close();
  }, [story]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [onClose]);

  const chapter = story ? STORY_CHAPTERS.find((c) => c.id === story.chapterId) : undefined;

  return (
    <dialog
      ref={ref}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      className="linear-dialog"
      aria-labelledby="storyUnlockTitle"
    >
      {story && (
        <div className="story-unlock">
          <figure className="polaroid" style={{ width: '168px' }}>
            <img src={story.animal.portrait} alt={`${story.animal.name}，${story.animal.species}`} width={512} height={512} />
            <figcaption>
              <span className="polaroid-name">{story.animal.name}</span>
              <span className="polaroid-note">{story.animal.species}</span>
            </figcaption>
          </figure>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
            <div className="eyebrow-text">
              {chapter?.title} · {story.lessonId}
            </div>
            <h2 id="storyUnlockTitle" className="headline-md">
              {story.headline ?? `${story.animal.name}找到家了`}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{story.outro}</p>
            <div className="story-quote">{story.newHome}</div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              想对{story.animal.name}或自己说一句话吗？（选填）
              <textarea
                className="text-input"
                style={{ minHeight: '64px', resize: 'vertical' }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="比如：今天终于搞懂了 before 和 after 的区别"
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={() => ref.current?.close()}>
                先这样
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onSaveReflection(text.trim());
                  ref.current?.close();
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};
