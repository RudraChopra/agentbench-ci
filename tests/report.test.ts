import { describe, expect, it } from 'vitest';
import { safeRunId } from '../src/report.js';

describe('safeRunId', () => {
  it('removes characters that are awkward in file paths', () => {
    const id = safeRunId(new Date('2026-06-10T21:40:10.000Z'));
    expect(id).toBe('2026-06-10T21-40-10-000Z');
  });
});
