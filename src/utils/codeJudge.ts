import type { CodingChallenge } from '../types';

/**
 * Removes comments while leaving string/template literals untouched, so a
 * keyword written in a comment can no longer satisfy an acceptance rule.
 * Handles // and /* *\/ (Apex, JS, SOQL) and <!-- --> (LWC templates).
 */
export function stripComments(code: string): string {
  let out = '';
  let i = 0;
  let quote: '"' | "'" | '`' | null = null;
  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (quote) {
      out += ch;
      if (ch === '\\') {
        out += next ?? '';
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }
    // SQL-style "-- note" lines used in SOQL starters (only at line start, so Apex `i--` is safe)
    if (ch === '-' && next === '-' && /(^|\n)[ \t]*$/.test(out)) {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      const block = code.slice(i, end === -1 ? code.length : end + 2);
      out += block.replace(/[^\n]/g, ''); // keep line count stable
      i = end === -1 ? code.length : end + 2;
      continue;
    }
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4);
      const block = code.slice(i, end === -1 ? code.length : end + 3);
      out += block.replace(/[^\n]/g, '');
      i = end === -1 ? code.length : end + 3;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function evaluateChallenge(challenge: CodingChallenge, code: string): string[] {
  const cleaned = stripComments(code);
  const passed: string[] = [];
  for (const rule of challenge.acceptanceRules) {
    const allMatched = rule.mustMatch.every((p) => new RegExp(p, 'i').test(cleaned));
    const noneForbidden = (rule.mustNotMatch || []).every((p) => !new RegExp(p, 'i').test(cleaned));
    if (allMatched && noneForbidden) passed.push(rule.id);
  }
  return passed;
}
