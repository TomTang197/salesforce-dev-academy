import type { ExamQuestion, ExamWeightDomain } from '../types';

export type CertLevel = 'PD1' | 'PD2';

export const EXAM_DOMAINS: ExamWeightDomain[] = [
  'Developer Fundamentals (27%)',
  'Process Automation & Logic (28%)',
  'User Interface (25%)',
  'Testing, Debugging & Deployment (20%)',
];

/** Reads the weight straight from the domain label, e.g. "(28%)" -> 0.28. */
export function domainWeight(domain: ExamWeightDomain): number {
  const match = domain.match(/\((\d+)%\)/);
  return match ? Number(match[1]) / 100 : 0;
}

export function domainShortName(domain: ExamWeightDomain): string {
  return domain.replace(/\s*\(\d+%\)\s*$/, '');
}

/** Unbiased Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Largest-remainder allocation of `total` slots across domains by weight. */
export function allocateByWeight(total: number, domains: ExamWeightDomain[] = EXAM_DOMAINS): Record<ExamWeightDomain, number> {
  const weights = domains.map(domainWeight);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const floors = raw.map(Math.floor);
  let remaining = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remaining <= 0) break;
    floors[i] += 1;
    remaining -= 1;
  }
  const result = {} as Record<ExamWeightDomain, number>;
  domains.forEach((d, i) => {
    result[d] = floors[i];
  });
  return result;
}

export function certPool(pool: ExamQuestion[], cert: CertLevel): ExamQuestion[] {
  return pool.filter((q) => q.certLevel === cert);
}

/**
 * Builds a mock exam for one certification, distributing questions across
 * domains by official weight and back-filling any domain shortfall.
 */
export function buildMockExam(
  pool: ExamQuestion[],
  options: { cert: CertLevel; count: number; rng?: () => number }
): ExamQuestion[] {
  const rng = options.rng ?? Math.random;
  const candidates = certPool(pool, options.cert);
  if (options.count >= candidates.length) return shuffle(candidates, rng);

  const shuffled = shuffle(candidates, rng);
  const allocation = allocateByWeight(options.count);
  const picked: ExamQuestion[] = [];
  const leftovers: ExamQuestion[] = [];

  for (const domain of EXAM_DOMAINS) {
    const inDomain = shuffled.filter((q) => q.examDomain === domain);
    picked.push(...inDomain.slice(0, allocation[domain]));
    leftovers.push(...inDomain.slice(allocation[domain]));
  }
  const unknownDomain = shuffled.filter((q) => !EXAM_DOMAINS.includes(q.examDomain));
  leftovers.push(...unknownDomain);

  if (picked.length < options.count) {
    picked.push(...shuffle(leftovers, rng).slice(0, options.count - picked.length));
  }
  return shuffle(picked, rng);
}

/** Official pacing: PD1 = 60 questions / 105 min, PD2 = 60 questions / 120 min. */
export function mockExamMinutes(cert: CertLevel, count: number): number {
  const perQuestion = cert === 'PD1' ? 105 / 60 : 120 / 60;
  return Math.max(5, Math.round(count * perQuestion));
}

export interface DomainScore {
  domain: ExamWeightDomain;
  correct: number;
  total: number;
  pct: number;
}

export function scoreByDomain(
  questions: ExamQuestion[],
  isCorrect: (q: ExamQuestion) => boolean
): DomainScore[] {
  return EXAM_DOMAINS.map((domain) => {
    const inDomain = questions.filter((q) => q.examDomain === domain);
    const correct = inDomain.filter(isCorrect).length;
    return {
      domain,
      correct,
      total: inDomain.length,
      pct: inDomain.length ? Math.round((correct / inDomain.length) * 100) : 0,
    };
  }).filter((s) => s.total > 0);
}
