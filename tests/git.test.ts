import { describe, expect, it } from 'vitest';
import { countPatchLines } from '../src/git.js';

describe('countPatchLines', () => {
  it('counts added and removed lines without diff headers', () => {
    const diff = [
      'diff --git a/a.ts b/a.ts',
      '--- a/a.ts',
      '+++ b/a.ts',
      '@@ -1,2 +1,2 @@',
      '-old',
      '+new',
      '+another'
    ].join('\n');
    expect(countPatchLines(diff)).toEqual({ addedLines: 2, removedLines: 1 });
  });
});
