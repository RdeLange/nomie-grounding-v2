// The 5-4-3-2-1 grounding exercise as plain rules, so they can be tested without the app.
export type Step = { count: number; sense: string; prompt: string };

export const STEPS: Step[] = [
  { count: 5, sense: 'see', prompt: 'Name five things you can see right now.' },
  { count: 4, sense: 'feel', prompt: 'Name four things you can feel touching your body.' },
  { count: 3, sense: 'hear', prompt: 'Name three things you can hear.' },
  { count: 2, sense: 'smell', prompt: 'Name two things you can smell.' },
  { count: 1, sense: 'taste', prompt: 'Name one thing you can taste.' },
];

// step: -1 not started, 0 to STEPS.length - 1 the step, STEPS.length finished
export const advance = (step: number): number => step + 1;

export const currentStep = (step: number): Step | null => (step >= 0 && step < STEPS.length ? STEPS[step] : null);

export const isFinished = (step: number): boolean => step >= STEPS.length;

// The note written into the timeline when the exercise is finished
export const FINISHED_NOTE = 'Grounding: 5-4-3-2-1 finished, I came back to the room #calm';
