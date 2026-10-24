import { describe, expect, it } from 'vitest';
import { STEPS, advance, currentStep, isFinished } from '../grounding';

describe('the 5-4-3-2-1 exercise', () => {
  it('goes through five steps, from five things seen to one thing tasted', () => {
    expect(currentStep(0)?.count).toBe(5);
    expect(currentStep(4)?.sense).toBe('taste');
    expect(currentStep(5)).toBeNull();
  });

  it('is finished after the last step', () => {
    let step = -1;
    for (let i = 0; i < STEPS.length + 1; i++) step = advance(step);
    expect(isFinished(step)).toBe(true);
    expect(isFinished(4)).toBe(false);
  });
});
