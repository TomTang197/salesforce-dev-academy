import React from 'react';
import type { ExamOption } from '../types';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';
type OptionId = ExamOption['id'];

interface ExamOptionListProps {
  questionId: string;
  multiple: boolean;
  selectCount: number;
  options: ExamOption[];
  selected: OptionId[];
  onToggle: (id: OptionId) => void;
  disabled?: boolean;
  showEnglish: boolean;
  showChinese: boolean;
  stateFor?: (opt: ExamOption) => OptionState;
  renderAfter?: (opt: ExamOption) => React.ReactNode;
}

/**
 * Native radio / checkbox group (Modern Web Guidance: forms) so screen readers
 * announce "radio button 2 of 4" / "checkbox, checked" and arrow keys work.
 */
export const ExamOptionList: React.FC<ExamOptionListProps> = ({
  questionId,
  multiple,
  selectCount,
  options,
  selected,
  onToggle,
  disabled = false,
  showEnglish,
  showChinese,
  stateFor,
  renderAfter,
}) => {
  const name = `answer-${questionId}`;
  return (
    <fieldset className="exam-option-group">
      <legend className="visually-hidden">
        {multiple ? `多选题，请选择 ${selectCount} 项 (Choose ${selectCount})` : '单选题，请选择 1 项 (Choose 1)'}
      </legend>
      {options.map((opt) => {
        const inputId = `${name}-${opt.id}`;
        const isSelected = selected.includes(opt.id);
        const state = stateFor ? stateFor(opt) : isSelected ? 'selected' : 'idle';
        return (
          <div key={opt.id} className="exam-option" data-state={state}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              id={inputId}
              name={name}
              value={opt.id}
              checked={isSelected}
              disabled={disabled}
              onChange={() => onToggle(opt.id)}
            />
            <label htmlFor={inputId}>
              <span className="exam-option-letter">{opt.id}</span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                {showEnglish && opt.textEn && (
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{opt.textEn}</span>
                )}
                {showChinese && (
                  <span
                    style={{
                      fontSize: '13px',
                      color: showEnglish ? 'var(--text-secondary)' : 'var(--text-primary)',
                    }}
                  >
                    {opt.text}
                  </span>
                )}
                {renderAfter?.(opt)}
              </span>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
};
