export type CharacterId = 'alan' | 'xiaoman' | 'laozhou' | 'qiqi';

export interface Character {
  id: CharacterId;
  name: string;
  initial: string;
  role: string;
}

export const CHARACTERS: Record<CharacterId, Character> = {
  alan: { id: 'alan', name: '阿岚', initial: '岚', role: '站长' },
  xiaoman: { id: 'xiaoman', name: '小满', initial: '满', role: '领养专员' },
  laozhou: { id: 'laozhou', name: '老周', initial: '周', role: '兽医' },
  qiqi: { id: 'qiqi', name: '七七', initial: '七', role: '捐赠与财务' },
};
