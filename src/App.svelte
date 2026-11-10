<script lang="ts">
  import { onMount } from 'svelte';
  import { STEPS, advance, currentStep, isFinished, FINISHED_NOTE } from './grounding';
  import { t, setLanguage } from './i18n/index.svelte';
  import { paletteFrom, glassFrom, tintTextFrom, type Palette, type Glass } from './palette';
  import { offerTracker } from './tracker-offer';
  import { onPrefsChange } from './prefs-live';

  let plugin: any;
  let view = $state<'modal' | 'widget'>('modal');
  let palette = $state<Palette>(paletteFrom(undefined));
  let glass = $state<Glass>(glassFrom(undefined));
  let tintText = $state(tintTextFrom(undefined));
  let scale = $state(1);
  let step = $state(-1);
  let sessions = $state(0);
  let ready = $state(false);

  const current = $derived(currentStep(step));
  const finished = $derived(isFinished(step));

  const applyNomieValues = () => {
    if (!plugin?.prefs) return;
    palette = paletteFrom(plugin.prefs);
    setLanguage(plugin.prefs?.language);
    glass = glassFrom(plugin.prefs);
    tintText = tintTextFrom(plugin.prefs);
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
      offerTracker(plugin, { tag: 'calm', get label() { return t('trackerLabel'); }, emoji: '🌿', color: '#34C759' });
      if (!ready) await load();
    });
  });
</script>

<div class="card" class:widget={view === 'widget'} style="--page: {palette.page}; --card: {palette.card}; --text: {palette.text}; --muted: {palette.textSecondary}; --line: {palette.separator}; --fill: {palette.fill}; --tint: {palette.tint}; --on-tint: {palette.onTint}; --tint-soft: {palette.tintSoft}; --good: {palette.good}; --good-soft: {palette.goodSoft}; --tint-text: {tintText}; --glass-fill: {glass.fill}; --glass-edge: {glass.edge}; --glass-blur: {glass.blur}; --glass-shadow: {glass.shadow}; --scale: {scale};">
  {#if view === 'widget'}
    <div class="head">🌿 <span class="meta">{t('widgetDone', { n: sessions })}</span></div>
    {#if current}
      <div class="name">{current.prompt}</div>
      <button class="primary wide" onclick={next}>{t('next')}</button>
    {:else if finished}
      <div class="name">{t('widgetFinished')}</div>
      <button class="primary wide" onclick={restart}>{t('restart')}</button>
    {:else}
      <div class="name">{t('widgetIdle')}</div>
      <button class="primary wide" onclick={next}>{t('start')}</button>
    {/if}
  {:else}
    <header class="top"><h1>{t('title')}</h1></header>
    <p class="muted">{t('subLine', { n: sessions, unit: sessions === 1 ? t('timeOne') : t('timeMany') })}</p>

    {#if current}
      <section class="panel">
        <div class="count">{current.count}</div>
        <p class="prompt">{current.prompt}</p>
        <button class="primary" onclick={next}>{step === STEPS.length - 1 ? t('finish') : t('next')}</button>
      </section>
    {:else if finished}
      <section class="panel done">
        <p>{t('finishedBody')}</p>
        <button class="primary" onclick={restart}>{t('restart')}</button>
        <button class="ghost" onclick={reflect}>{t('writeReflection')}</button>
      </section>
    {:else}
      <section class="panel">
        <p>{t('intro')}</p>
        <button class="primary" onclick={next}>{t('start')}</button>
      </section>
    {/if}

    <h2>{t('stepsHead')}</h2>
    <ol class="steps">
      {#each STEPS as s, i (s.count)}
        <li class:active={i === step} class:done={i < step}>{s.line}</li>
      {/each}
    </ol>
  {/if}
</div>

<style>
  /* the app's text: its iOS font stack, with the app's smoothing */
  :global(body) { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif; -webkit-font-smoothing: antialiased; --ios-font-rounded: ui-rounded, -apple-system, system-ui, sans-serif; }
  /* the header is a Liquid Glass bar (D-glass): it stays at the top and the content scrolls under it */
  .top { position: sticky; top: 0; z-index: 2; margin: -16px -16px 8px; padding: 16px 16px 10px; background: var(--glass-fill); -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur); border-bottom: 1px solid var(--glass-edge); }
  .card { box-sizing: border-box; min-height: 100vh; padding: 16px; background: var(--page); color: var(--text); font-size: calc(16px * var(--scale)); line-height: 1.4; }
  .card.widget { min-height: 0; padding: 12px; font-size: calc(14px * var(--scale)); }
  h1 { margin: 0; font-size: calc(26px * var(--scale)); font-weight: 700; }
  h2 { margin: 20px 0 6px; font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .muted { margin: 4px 0; color: var(--muted); }
  .panel { padding: 16px; border-radius: 16px; background: var(--card); text-align: center; }
  .count { font-family: var(--ios-font-rounded); font-size: calc(56px * var(--scale)); font-weight: 700; color: var(--tint); line-height: 1; }
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
  .steps li.active { font-weight: 700; color: var(--tint-text); }
  .steps li.done { color: var(--muted); text-decoration: line-through; }
</style>
