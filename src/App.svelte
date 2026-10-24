<script lang="ts">
  import { onMount } from 'svelte';
  import { STEPS, advance, currentStep, isFinished, FINISHED_NOTE } from './grounding';
  import { paletteFrom, type Palette } from './palette';
  import { offerTracker } from './tracker-offer';
  import { onPrefsChange } from './prefs-live';

  let plugin: any;
  let view = $state<'modal' | 'widget'>('modal');
  let palette = $state<Palette>(paletteFrom(undefined));
  let scale = $state(1);
  let step = $state(-1);
  let sessions = $state(0);
  let ready = $state(false);

  const current = $derived(currentStep(step));
  const finished = $derived(isFinished(step));

  const applyNomieValues = () => {
    if (!plugin?.prefs) return;
    palette = paletteFrom(plugin.prefs);
    scale = plugin.prefs.fontScale || 1;
  };

  const load = async () => {
    await plugin.storage.init();
    sessions = plugin.storage.getItem('sessions') || 0;
    ready = true;
  };

  const next = async () => {
    step = advance(step);
    if (isFinished(step)) {
      sessions += 1;
      await plugin.storage.setItem('sessions', sessions);
      plugin.createNote(FINISHED_NOTE);
    }
  };

  const restart = () => (step = -1);

  const reflect = () => plugin.openNoteEditor('Grounding reflection: How do I feel now compared with before?\n');

  onMount(() => {
    plugin = new NomiePlugin({
      name: 'Nomie Grounding',
      emoji: '🌿',
      description: 'A guided 5-4-3-2-1 exercise to bring you back to the room when you feel overwhelmed. Finishing it writes a calm note into your timeline.',
      uses: ['createNote', 'openNoteEditor', 'getStorageItem', 'setStorageItem', 'getTrackable', 'openTrackableEditor', 'confirm'],
      version: '2.0',
      addToCaptureMenu: true,
      addToMoreMenu: true,
      addToWidgets: true,
    });
    onPrefsChange(plugin, () => applyNomieValues());
  plugin.onRegistered(async () => {
      applyNomieValues();
      await load();
    });
    plugin.onWidget(async () => {
      view = 'widget';
      applyNomieValues();
      if (!ready) await load();
    });
    plugin.onUIOpened(async () => {
      view = 'modal';
      applyNomieValues();
      offerTracker(plugin, { tag: 'calm', label: 'Calm', emoji: '🌿', color: '#34C759' });
      if (!ready) await load();
    });
  });
</script>

<div class="card" class:widget={view === 'widget'} style="--page: {palette.page}; --card: {palette.card}; --text: {palette.text}; --muted: {palette.textSecondary}; --line: {palette.separator}; --fill: {palette.fill}; --tint: {palette.tint}; --on-tint: {palette.onTint}; --tint-soft: {palette.tintSoft}; --good: {palette.good}; --good-soft: {palette.goodSoft}; --scale: {scale};">
  {#if view === 'widget'}
    <div class="head">🌿 <span class="meta">{sessions} done</span></div>
    {#if current}
      <div class="name">Name {current.count} things you {current.sense}</div>
      <button class="primary wide" onclick={next}>Next</button>
    {:else if finished}
      <div class="name">You are back in the room.</div>
      <button class="primary wide" onclick={restart}>Start again</button>
    {:else}
      <div class="name">Five things, four, three, two, one.</div>
      <button class="primary wide" onclick={next}>Start</button>
    {/if}
  {:else}
    <h1>Grounding</h1>
    <p class="muted">5-4-3-2-1 · {sessions} {sessions === 1 ? 'time' : 'times'} done</p>

    {#if current}
      <section class="panel">
        <div class="count">{current.count}</div>
        <p class="prompt">{current.prompt}</p>
        <button class="primary" onclick={next}>{step === STEPS.length - 1 ? 'Finish' : 'Next'}</button>
      </section>
    {:else if finished}
      <section class="panel done">
        <p>You are back in the room. Your calm moment is in the timeline.</p>
        <button class="primary" onclick={restart}>Start again</button>
        <button class="ghost" onclick={reflect}>Write a reflection</button>
      </section>
    {:else}
      <section class="panel">
        <p>Use this when you feel overwhelmed. Take your time with each step.</p>
        <button class="primary" onclick={next}>Start</button>
      </section>
    {/if}

    <h2>The steps</h2>
    <ol class="steps">
      {#each STEPS as s, i (s.sense)}
        <li class:active={i === step} class:done={i < step}>{s.count} things you {s.sense}</li>
      {/each}
    </ol>
  {/if}
</div>

<style>
  .card { box-sizing: border-box; min-height: 100vh; padding: 16px; background: var(--page); color: var(--text); font-size: calc(16px * var(--scale)); line-height: 1.4; }
  .card.widget { min-height: 0; padding: 12px; font-size: calc(14px * var(--scale)); }
  h1 { margin: 0; font-size: calc(26px * var(--scale)); font-weight: 700; }
  h2 { margin: 20px 0 6px; font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .muted { margin: 4px 0; color: var(--muted); }
  .panel { padding: 16px; border-radius: 16px; background: var(--card); text-align: center; }
  .count { font-size: calc(56px * var(--scale)); font-weight: 700; color: var(--tint); line-height: 1; }
  .prompt { font-size: calc(18px * var(--scale)); font-weight: 600; }
  .done { background: var(--good-soft); color: var(--good); }
  .head { display: flex; align-items: center; gap: 8px; font-weight: 600; }
  .meta { margin-left: auto; color: var(--muted); }
  .name { margin: 6px 0; font-weight: 600; }
  .primary, .ghost { padding: 12px 16px; border-radius: 12px; font: inherit; font-weight: 600; cursor: pointer; border: 0; margin-top: 8px; }
  .primary { background: var(--tint); color: var(--on-tint); }
  .ghost { background: var(--fill); color: var(--text); }
  .wide { width: 100%; }
  .steps { margin: 0; padding-left: 20px; }
  .steps li { padding: 4px 0; }
  .steps li.active { font-weight: 700; color: var(--tint); }
  .steps li.done { color: var(--muted); text-decoration: line-through; }
</style>
