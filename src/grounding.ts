// The 5-4-3-2-1 grounding exercise as plain rules, so they can be tested without the app.
import { t } from './i18n/index.svelte';

// sense is the English word for the sense (used for the step's identity); line and prompt are read at use time
export type Step = { count: number; sense: string; line: string; prompt: string };

export const STEPS: Step[] = [
  { count: 5, get sense() { return t('sense_see'); }, get line() { return t('line_see'); }, get prompt() { return t('prompt_see'); } },
  { count: 4, get sense() { return t('sense_feel'); }, get line() { return t('line_feel'); }, get prompt() { return t('prompt_feel'); } },
  { count: 3, get sense() { return t('sense_hear'); }, get line() { return t('line_hear'); }, get prompt() { return t('prompt_hear'); } },
  { count: 2, get sense() { return t('sense_smell'); }, get line() { return t('line_smell'); }, get prompt() { return t('prompt_smell'); } },
  { count: 1, get sense() { return t('sense_taste'); }, get line() { return t('line_taste'); }, get prompt() { return t('prompt_taste'); } },
];

// step: -1 not started, 0 to STEPS.length - 1 the step, STEPS.length finished
export const advance = (step: number): number => step + 1;

export const currentStep = (step: number): Step | null => (step >= 0 && step < STEPS.length ? STEPS[step] : null);

export const isFinished = (step: number): boolean => step >= STEPS.length;

// The note written into the timeline when the exercise is finished
export const FINISHED_NOTE = 'Grounding: 5-4-3-2-1 finished, I came back to the room #calm';
