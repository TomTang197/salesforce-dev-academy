import type { Mood } from '../../types';
import type { CharacterId } from './characters';

export interface MoodOption {
  mood: Mood;
  label: string;
  hint: string;
  minutes: number | null;
  speakerId: CharacterId;
  reply: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { mood: 'tired', label: '有点累', hint: '20 分钟 · 轻量保温', minutes: 20, speakerId: 'alan', reply: '累了就去喂喂猫吧，看几张卡就好。' },
  { mood: 'calm', label: '平静', hint: '45 分钟 · 一讲课', minutes: 45, speakerId: 'xiaoman', reply: '今天也来啦！有几张工单我攒着等你。' },
  { mood: 'energized', label: '有劲', hint: '90 分钟 · 课程 + 实验', minutes: 90, speakerId: 'laozhou', reply: '好。今天可以啃硬骨头。' },
  { mood: 'drift', label: '想放空', hint: '不排任务 · 只是来看看', minutes: null, speakerId: 'alan', reply: '那就只是来坐坐，看看它们也很好。' },
];
