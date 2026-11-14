import { describe, it, expect } from 'vitest';
import { CODING_CHALLENGES } from '../data/challenges';
import { stripComments, evaluateChallenge } from './codeJudge';

describe('stripComments', () => {
  it('removes line, block and HTML comments but keeps strings', () => {
    const code = [
      "String url = 'callout:Registry//v1'; // for (Account a : [SELECT Id FROM Account])",
      '/* Database.insert(list, false) */',
      '<template><!-- lwc:if={x} --><p>{label}</p></template>',
      'const s = "// not a comment";',
    ].join('\n');
    const out = stripComments(code);
    expect(out).toContain("'callout:Registry//v1'");
    expect(out).not.toContain('SELECT Id FROM Account');
    expect(out).not.toContain('Database.insert');
    expect(out).not.toContain('lwc:if');
    expect(out).toContain('"// not a comment"');
    expect(out.split('\n')).toHaveLength(4);
  });

  it('treats leading -- as a SOQL note but keeps Apex decrement', () => {
    const out = stripComments('-- TODO: add FOR UPDATE\nSELECT Id FROM Case\nfor (Integer i = 5; i > 0; i--) { n--; }');
    expect(out).not.toContain('FOR UPDATE');
    expect(out).toContain('i--) { n--; }');
  });
});

describe('challenge judge', () => {
  for (const ch of CODING_CHALLENGES) {
    it(`${ch.id}: reference solution passes every rule`, () => {
      expect(evaluateChallenge(ch, ch.referenceSolution)).toHaveLength(ch.acceptanceRules.length);
    });

    it(`${ch.id}: starter code does not pass every rule`, () => {
      expect(evaluateChallenge(ch, ch.starterCode).length).toBeLessThan(ch.acceptanceRules.length);
    });

    it(`${ch.id}: answer hidden in comments does not pass`, () => {
      const commented = ch.referenceSolution
        .split('\n')
        .map((line) => `// ${line}`)
        .join('\n');
      expect(evaluateChallenge(ch, `${ch.starterCode}\n${commented}`).length).toBeLessThan(ch.acceptanceRules.length);
    });
  }
});
