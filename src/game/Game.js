import * as THREE from 'three';
import { REGIONS } from '../data/geo.js';
import {
  TREATIES, TREATY_BY_ID, MANDATE_CLASSES, COMPARISON, COMPARISON_REGION_STYLE, COMPARISON_LEGEND,
} from '../data/treaties.js';
import { sound } from '../audio.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const TURKEY_COLOR = '#38bdf8';
const ARAB_IDS = ['palestine', 'transjordan', 'iraq', 'hejaz', 'yemen', 'syria_lebanon'];
const RETURNED = ['smyrna', 'eastern_thrace', 'straits'];
const TURKEY_SUBREGIONS = ['smyrna', 'eastern_thrace', 'straits', 'dodecanese_adalia'];
const MAX_WRONG = 3;

const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

export class Game {
  constructor(scene) {
    this.scene = scene;
    this.treaty = TREATIES[0];
    this.theatre = 'all';
    this.phase = 'welcome'; // asking | answered | browse | summary | welcome
    this.queue = [];
    this.q = null;
    this.wrong = 0;
    this.hintUsed = false;
    this.solved = {}; // regionId -> { treaty, q }
    this.progress = Object.fromEntries(TREATIES.map((t) => [t.id, new Set()]));
    this.treatyScore = Object.fromEntries(TREATIES.map((t) => [t.id, 0]));
    this.firstTry = Object.fromEntries(TREATIES.map((t) => [t.id, 0]));
    this.compare = false;
    this.compareT = 0;
    this.drawerOpen = false;
    this.toastTimer = null;
  }

  // ------------------------------------------------------------------ setup
  init() {
    this.bindUI();
    this.updateHeader();
    this.refreshStyles();
    this.setTheatreButtons();
    this.renderCompare();
    this.scene.setPickEnabled(true);
    this.showWelcome();
  }

  bindUI() {
    $('treatyBtn').onclick = () => this.showTreatyMenu();
    $('briefBtn').onclick = () => this.showBriefing(false);
    $('helpBtn').onclick = () => this.showHelp();
    $('soundBtn').onclick = () => {
      sound.enabled = !sound.enabled;
      $('soundBtn').textContent = sound.enabled ? '🔊' : '🔇';
      sound.click();
    };
    $('hintBtn').onclick = () => this.useHint();
    $('skipBtn').onclick = () => this.skip();
    $('dClose').onclick = () => this.closeDrawer();
    $('dNext').onclick = () => this.onNext();
    $('compareBtn').onclick = () => this.toggleCompare();
    $('cClose').onclick = () => this.toggleCompare(false);
    $('cSlider').oninput = (e) => {
      this.stopPlay();
      this.applyComparison(e.target.value / 100);
    };
    $('cPlay').onclick = () => this.playCompare();
    document.querySelectorAll('[data-theatre]').forEach((b) => {
      b.onclick = () => this.setTheatre(b.dataset.theatre);
    });
    document.querySelectorAll('[data-view]').forEach((b) => {
      b.onclick = () => {
        sound.click();
        this.scene.setView(b.dataset.view);
        this.markView(b.dataset.view);
      };
    });
    $('modal').addEventListener('pointerdown', (e) => {
      if (e.target === $('modal') && this.modalDismissable) this.closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!$('modal').classList.contains('hidden') && this.modalDismissable) this.closeModal();
        else this.closeDrawer();
      }
    });
  }

  markView(name) {
    document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.view === name)));
  }

  // ------------------------------------------------------------------ modal helpers
  openModal(html, { dismissable = true } = {}) {
    this.modalDismissable = dismissable;
    $('modalCard').innerHTML = html;
    $('modal').classList.remove('hidden');
    $('modal').classList.add('flex');
    return $('modalCard');
  }

  closeModal() {
    $('modal').classList.add('hidden');
    $('modal').classList.remove('flex');
  }

  showWelcome() {
    const card = this.openModal(
      `<div class="text-center">
        <div class="text-4xl mb-1">🌍</div>
        <h1 class="text-2xl font-bold">Peace Treaties 3D</h1>
        <p class="text-amber-300 text-sm mb-3">Paris, 1919 – Lausanne, 1923</p>
      </div>
      <p class="text-sm text-slate-200 mb-3">After the First World War the victors redrew the maps of Europe, Africa, the Middle East and the Pacific. Find each lost territory, colony or mandate on the 3D map to unlock its textbook card.</p>
      <ul class="text-sm text-slate-300 space-y-1.5 mb-4">
        <li>👆 <b>Tap / click</b> the territory you think is correct</li>
        <li>✋ <b>Drag</b> to move the map &middot; <b>pinch</b> or <b>scroll</b> to zoom</li>
        <li>🖱️ <b>Right-drag</b> (mouse) or <b>two-finger twist</b> to tilt the map</li>
        <li>🧭 Use the <b>region buttons</b> at the bottom to jump between theatres</li>
        <li>⚖️ Use <b>Lausanne Comparison</b> to see how Sèvres was overturned</li>
      </ul>
      <button id="mStart" class="btn-primary w-full">Start with the Treaty of Versailles</button>
      <button id="mMenu" class="w-full mt-2 text-sm text-slate-300 hover:text-white py-2">Choose a different treaty</button>`,
      { dismissable: false },
    );
    card.querySelector('#mStart').onclick = () => { sound.click(); this.startTreaty('versailles'); };
    card.querySelector('#mMenu').onclick = () => this.showTreatyMenu();
  }

  showHelp() {
    const card = this.openModal(
      `<h2 class="text-xl font-bold mb-2">How to play</h2>
      <ul class="text-sm text-slate-200 space-y-2 mb-3">
        <li><b>Goal:</b> locate the territory named in the prompt. Correct answers score up to 100 points.</li>
        <li><b>Wrong answer:</b> −30 points each. After 3 mistakes the answer is revealed for 0 points.</li>
        <li><b>Hint:</b> shows a geographic clue for −20 points.</li>
        <li><b>Touch:</b> drag to pan, pinch to zoom, two-finger twist to tilt. <b>Mouse:</b> left-drag pans, right-drag tilts, scroll zooms.</li>
        <li><b>Theatre switcher:</b> practise only European losses or only overseas colonies / mandates.</li>
        <li><b>Mandates:</b> Class A (Arab lands, nearly ready for independence), Class B (central Africa) and Class C (South West Africa and the Pacific, governed as part of the mandatory power).</li>
      </ul>
      <button id="mOk" class="btn-primary w-full">Back to the map</button>`,
    );
    card.querySelector('#mOk').onclick = () => this.closeModal();
  }

  showTreatyMenu() {
    sound.click();
    const rows = TREATIES.map((t) => {
      const done = this.progress[t.id].size;
      const total = t.questions.length;
      return `<button data-t="${t.id}" class="w-full text-left rounded-xl bg-white/5 hover:bg-white/10 p-3 flex items-center gap-3 border ${
        t.id === this.treaty.id ? 'border-white/40' : 'border-transparent'
      }">
        <span class="w-3 h-3 rounded-full shrink-0" style="background:${t.accent}"></span>
        <span class="flex-1 min-w-0">
          <span class="block font-semibold text-sm">${esc(t.name)}</span>
          <span class="block text-xs text-slate-400">${esc(t.defeated)} · ${esc(t.date)}</span>
        </span>
        <span class="text-xs text-slate-300 tabular-nums text-right">${done}/${total}<br><span class="text-amber-300">${this.treatyScore[t.id]} pts</span></span>
      </button>`;
    }).join('');
    const card = this.openModal(
      `<h2 class="text-xl font-bold mb-3">Choose a treaty</h2><div class="space-y-2 mb-3">${rows}</div>
      <button id="mClose" class="w-full text-sm text-slate-300 hover:text-white py-2">Close</button>`,
    );
    card.querySelectorAll('[data-t]').forEach((b) => {
      b.onclick = () => this.startTreaty(b.dataset.t);
    });
    card.querySelector('#mClose').onclick = () => this.closeModal();
  }

  showBriefing(startAfter = false) {
    const t = this.treaty;
    const terms = t.terms
      .map(([k, v]) => `<li class="flex gap-2"><span class="font-semibold w-24 shrink-0" style="color:${t.accent}">${esc(k)}</span><span>${esc(v)}</span></li>`)
      .join('');
    const card = this.openModal(
      `<div class="text-[11px] uppercase tracking-wider font-semibold" style="color:${t.accent}">${esc(t.date)} · ${esc(t.defeated)}</div>
      <h2 class="text-2xl font-bold mb-2">${esc(t.name)}</h2>
      <p class="text-sm text-slate-200 mb-3">${esc(t.blurb)}</p>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-1">Key terms</h3>
      <ul class="text-sm text-slate-200 space-y-1.5 mb-4">${terms}</ul>
      <button id="mGo" class="btn-primary w-full">${startAfter ? 'Start round →' : 'Back to the map'}</button>`,
      { dismissable: !startAfter },
    );
    card.querySelector('#mGo').onclick = () => {
      sound.click();
      this.closeModal();
      if (startAfter) this.beginRound();
    };
  }

  // ------------------------------------------------------------------ treaties & rounds
  startTreaty(id) {
    sound.click();
    if (this.compare) this.toggleCompare(false);
    this.treaty = TREATY_BY_ID[id];
    this.setDrawer(false);
    this.updateHeader();
    this.refreshStyles();
    this.showBriefing(true);
    // Lausanne is about Anatolia; the others open on the most relevant theatre
    const view = this.treaty.questions[0]?.view ?? 'europe';
    this.scene.setView(view);
    this.markView(view);
  }

  poolForTheatre() {
    const t = this.treaty;
    const done = this.progress[t.id];
    const remaining = t.questions.filter((x) => !done.has(x.region));
    let pool = this.theatre === 'all' ? remaining : remaining.filter((x) => x.theatre === this.theatre);
    if (!pool.length && remaining.length && this.theatre !== 'all') {
      this.toast(`No more ${this.theatre === 'europe' ? 'European' : 'colonial'} questions in this treaty - showing the rest.`);
      this.theatre = 'all';
      this.setTheatreButtons();
      pool = remaining;
    }
    return pool;
  }

  beginRound() {
    this.queue = shuffle(this.poolForTheatre());
    // Lausanne: ask about the whole of Anatolia first, before its sub-regions are shown
    if (this.treaty.isLausanne) {
      this.queue.sort((a, b) => (b.region === 'turkey_1923') - (a.region === 'turkey_1923'));
    }
    this.nextQuestion();
  }

  nextQuestion() {
    this.setDrawer(false);
    this.wrong = 0;
    this.hintUsed = false;
    if (!this.queue.length) {
      this.finishRound();
      return;
    }
    this.q = this.queue.shift();
    this.phase = 'asking';
    this.scene.setHint(this.q.region, false);
    this.refreshStyles();
    $('qText').textContent = `Find: ${REGIONS[this.q.region].name}`;
    $('qClue').classList.add('hidden');
    $('qClue').textContent = '';
    $('hintBtn').disabled = false;
    $('hintBtn').classList.remove('opacity-40');
    this.updatePrompt();
    this.updateHeader();
    if ($('guideToggle').checked) {
      this.scene.setView(this.q.view);
      this.markView(this.q.view);
    }
  }

  currentPoints() {
    return Math.max(100 - 30 * this.wrong - (this.hintUsed ? 20 : 0), this.wrong || this.hintUsed ? 10 : 100);
  }

  updatePrompt() {
    const show = this.phase === 'asking' && !this.compare;
    $('prompt').classList.toggle('hidden', !show);
    if (!show) return;
    const total = this.treaty.questions.length;
    const n = this.progress[this.treaty.id].size + 1;
    $('qCount').textContent = `${this.treaty.short} · Question ${Math.min(n, total)} of ${total}`;
    $('qPts').textContent = `Worth ${this.currentPoints()} pts`;
  }

  updateHeader() {
    const t = this.treaty;
    $('treatyTitle').textContent = t.name;
    $('treatyDate').textContent = `${t.date} · ${t.defeated}`;
    $('treatyDot').style.background = t.accent;
    const total = Object.values(this.treatyScore).reduce((a, b) => a + b, 0);
    $('score').textContent = total;
    const done = this.progress[t.id].size;
    const all = t.questions.length;
    $('progress').style.width = `${(done / all) * 100}%`;
    $('progress').style.background = t.accent;
    $('progressText').textContent = `${done} / ${all}`;
  }

  setTheatre(th) {
    sound.click();
    this.theatre = th;
    this.setTheatreButtons();
    if (this.phase === 'asking' || this.phase === 'answered' || this.phase === 'browse' || this.phase === 'summary') {
      this.setDrawer(false);
      this.beginRound();
    }
    const view = th === 'colonies' ? 'africa' : 'europe';
    if (!$('guideToggle').checked) {
      this.scene.setView(view);
      this.markView(view);
    }
  }

  setTheatreButtons() {
    document.querySelectorAll('[data-theatre]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theatre === this.theatre)));
  }

  // ------------------------------------------------------------------ interaction
  handleHover(id, pos) {
    const tip = $('tip');
    const reveal = id && (this.solved[id] || this.compare || this.phase === 'browse' || this.phase === 'summary');
    if (!reveal || !pos) {
      tip.classList.add('hidden');
      return;
    }
    tip.textContent = REGIONS[id].name;
    tip.classList.remove('hidden');
    tip.style.left = `${Math.min(pos.x + 14, window.innerWidth - 180)}px`;
    tip.style.top = `${pos.y + 14}px`;
  }

  handlePick(id, pos) {
    $('tip').classList.add('hidden');
    if (this.compare) return this.pickCompare(id);
    if (this.phase === 'asking') return this.answer(id, pos);
    if (id && this.solved[id]) {
      sound.click();
      this.scene.bump(id);
      this.openCard(this.solved[id].q, this.solved[id].treaty, { browse: true });
    } else if (this.phase === 'answered') {
      this.toast('Press "Next question" to continue.');
    }
  }

  answer(id, pos) {
    const q = this.q;
    if (!id) {
      this.toast('Tap one of the territories on the map.');
      return;
    }
    if (id === q.region) {
      const pts = this.currentPoints();
      if (!this.wrong && !this.hintUsed) this.firstTry[this.treaty.id]++;
      this.completeQuestion(pts, pos);
      return;
    }
    // wrong
    this.wrong++;
    sound.wrong();
    this.scene.flashWrong(id);
    this.floater(pos, '✗', true);
    $('prompt').firstElementChild.firstElementChild.classList.remove('shake');
    void $('prompt').offsetWidth;
    $('prompt').firstElementChild.firstElementChild.classList.add('shake');
    this.updatePrompt();
    if (this.wrong >= MAX_WRONG) {
      this.toast(`That was ${REGIONS[id].name}. Revealing the answer…`);
      this.scene.setHint(q.region, true);
      this.scene.focusRegion(q.region, 6);
      this.phase = 'answered';
      setTimeout(() => {
        this.scene.setHint(q.region, false);
        this.completeQuestion(0, null, true);
      }, 1400);
      return;
    }
    this.toast(`Not quite - that's ${REGIONS[id].name}.`);
    if (this.wrong >= 2) this.showClue(false);
  }

  useHint() {
    if (this.phase !== 'asking' || this.hintUsed) return;
    this.hintUsed = true;
    this.showClue(true);
    this.updatePrompt();
  }

  showClue(paid) {
    const el = $('qClue');
    el.textContent = `💡 ${this.q.clue}`;
    el.classList.remove('hidden');
    $('hintBtn').disabled = true;
    $('hintBtn').classList.add('opacity-40');
    sound.click();
    if (paid) this.hintUsed = true;
  }

  skip() {
    if (this.phase !== 'asking') return;
    sound.click();
    this.queue.push(this.q);
    this.nextQuestion();
  }

  completeQuestion(points, pos, revealed = false) {
    const q = this.q;
    const t = this.treaty;
    this.phase = 'answered';
    this.progress[t.id].add(q.region);
    this.treatyScore[t.id] += points;
    this.solved[q.region] = { treaty: t, q };
    this.scene.markSolved(q.region, t.accent);
    this.scene.celebrate(q.region, t.accent);
    this.refreshLabels();
    this.updateHeader();
    $('prompt').classList.add('hidden');
    if (!revealed) {
      sound.correct();
      const at = pos ?? this.scene.regionScreenPos(q.region);
      this.floater(at, `+${points}`, false);
      $('score').classList.remove('flash-good');
      void $('score').offsetWidth;
      $('score').classList.add('flash-good');
    }
    this.openCard(q, t, { points, revealed });
  }

  // ------------------------------------------------------------------ drawer
  openCard(q, treaty, { points = null, revealed = false, browse = false } = {}) {
    const def = REGIONS[q.region];
    const c = q.card;
    $('dTreaty').textContent = `${treaty.short} · ${treaty.date}`;
    $('dTreaty').style.color = treaty.accent;
    $('dTitle').textContent = def.name;
    const mandate = c.mandate ? MANDATE_CLASSES[c.mandate] : null;
    const chipColors = { A: '#34d399', B: '#fbbf24', C: '#f472b6' };
    $('dBody').innerHTML = `
      <div class="flex flex-wrap gap-1.5">
        <span class="chip bg-white/10">${esc(c.lostBy)} → <b>${esc(c.gainer)}</b></span>
        ${mandate ? '' : `<span class="chip" style="background:${treaty.accent}33;color:${treaty.accent}">${esc(c.status)}</span>`}
        ${mandate ? `<span class="chip" style="background:${chipColors[c.mandate]}33;color:${chipColors[c.mandate]}">Class ${c.mandate} mandate</span>` : ''}
      </div>
      ${points !== null ? `<div class="text-amber-300 font-semibold">${revealed ? 'Answer revealed - 0 points' : `+${points} points`}</div>` : ''}
      <p class="leading-relaxed text-slate-100">${esc(c.summary)}</p>
      <div>
        <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-1">Key points</h3>
        <ul class="list-disc pl-5 space-y-0.5 text-slate-200">${c.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>
      ${mandate ? `<div class="rounded-lg bg-white/5 p-2.5 text-xs text-slate-300"><b style="color:${chipColors[c.mandate]}">${mandate.label}.</b> ${esc(mandate.text)}</div>` : ''}
      <div class="rounded-lg bg-white/5 p-2.5 text-xs text-slate-300"><b>Treaty context.</b> ${esc(treaty.blurb)}</div>`;
    const last = !this.queue.length;
    const btn = $('dNext');
    if (browse || this.phase !== 'answered') {
      btn.textContent = 'Close';
      btn.dataset.mode = 'close';
    } else {
      btn.textContent = last ? 'Finish round ✓' : 'Next question →';
      btn.dataset.mode = 'next';
    }
    btn.style.display = '';
    this.setDrawer(true);
  }

  openCompareCard(row) {
    $('dTreaty').textContent = 'Sèvres → Lausanne';
    $('dTreaty').style.color = '#38bdf8';
    $('dTitle').textContent = row.topic;
    const tone = { gain: ['Regained at Lausanne', '#34d399'], mixed: ['Partly regained', '#fbbf24'], loss: ['Not overturned', '#f87171'] }[row.outcome];
    $('dBody').innerHTML = `
      <span class="chip" style="background:${tone[1]}33;color:${tone[1]}">${tone[0]}</span>
      <div class="rounded-lg bg-cyan-500/10 border border-cyan-400/30 p-3"><div class="text-xs uppercase text-cyan-300 mb-1">Sèvres, Aug 1920</div>${esc(row.sevres)}</div>
      <div class="rounded-lg bg-blue-500/10 border border-blue-400/30 p-3"><div class="text-xs uppercase text-blue-300 mb-1">Lausanne, Jul 1923</div>${esc(row.lausanne)}</div>`;
    $('dNext').textContent = 'Close';
    $('dNext').dataset.mode = 'close';
    this.setDrawer(true);
  }

  setDrawer(open) {
    this.drawerOpen = open;
    $('drawer').classList.toggle('open', open);
    $('drawer').setAttribute('aria-hidden', String(!open));
  }

  /** Dismissing the card right after an answer moves on, as if "Next" had been pressed. */
  closeDrawer() {
    if (this.drawerOpen && this.phase === 'answered' && !this.compare && $('dNext').dataset.mode === 'next') {
      this.nextQuestion();
      return;
    }
    this.setDrawer(false);
  }

  onNext() {
    sound.click();
    if ($('dNext').dataset.mode === 'next') this.nextQuestion();
    else this.setDrawer(false);
  }

  // ------------------------------------------------------------------ round end
  finishRound() {
    const t = this.treaty;
    this.phase = 'summary';
    this.updatePrompt();
    this.updateHeader();
    sound.fanfare();
    const idx = TREATIES.indexOf(t);
    const next = TREATIES[idx + 1];
    const done = this.progress[t.id].size;
    const total = t.questions.length;
    const pct = Math.round((this.treatyScore[t.id] / (total * 100)) * 100);
    const stars = pct >= 85 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
    const card = this.openModal(
      `<div class="text-center">
        <div class="text-3xl tracking-widest mb-1">${'★'.repeat(stars)}<span class="text-white/20">${'★'.repeat(3 - stars)}</span></div>
        <h2 class="text-2xl font-bold">${esc(t.name)} complete</h2>
        <p class="text-slate-300 text-sm mb-3">${done} of ${total} territories located</p>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center mb-4">
        <div class="rounded-xl bg-white/5 p-2"><div class="text-xl font-bold text-amber-300">${this.treatyScore[t.id]}</div><div class="text-[11px] text-slate-400">round score</div></div>
        <div class="rounded-xl bg-white/5 p-2"><div class="text-xl font-bold">${this.firstTry[t.id]}</div><div class="text-[11px] text-slate-400">first-try</div></div>
        <div class="rounded-xl bg-white/5 p-2"><div class="text-xl font-bold">${pct}%</div><div class="text-[11px] text-slate-400">accuracy</div></div>
      </div>
      <div class="space-y-2">
        ${t.isLausanne ? '<button id="mCompare" class="btn-primary w-full">⚖️ Compare with Sèvres</button>' : ''}
        ${next ? `<button id="mNext" class="${t.isLausanne ? 'w-full h-11 rounded-xl bg-white/10 hover:bg-white/20' : 'btn-primary w-full'}">Next: ${esc(next.name)} →</button>` : ''}
        <button id="mExplore" class="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20">Explore the map</button>
        <button id="mReplay" class="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20">↻ Replay this treaty</button>
        <button id="mMenu" class="w-full text-sm text-slate-300 hover:text-white py-2">All treaties</button>
      </div>`,
      { dismissable: false },
    );
    card.querySelector('#mCompare')?.addEventListener('click', () => { this.closeModal(); this.phase = 'browse'; this.toggleCompare(true); });
    card.querySelector('#mNext')?.addEventListener('click', () => this.startTreaty(next.id));
    card.querySelector('#mExplore').onclick = () => { this.closeModal(); this.phase = 'browse'; this.scene.setView('world'); this.markView('world'); this.toast('Explore mode: tap any coloured territory to re-read its card.'); };
    card.querySelector('#mReplay').onclick = () => { this.resetTreaty(t.id); this.closeModal(); this.showBriefing(true); };
    card.querySelector('#mMenu').onclick = () => this.showTreatyMenu();
  }

  resetTreaty(id) {
    const t = TREATY_BY_ID[id];
    this.progress[id].clear();
    this.treatyScore[id] = 0;
    this.firstTry[id] = 0;
    for (const x of t.questions) if (this.solved[x.region]?.treaty.id === id) delete this.solved[x.region];
    this.updateHeader();
    this.refreshStyles();
  }

  // ------------------------------------------------------------------ map styling
  /** Single source of truth for how every region looks. */
  refreshStyles() {
    const sc = this.scene;
    const lausanneRound = this.treaty.isLausanne;
    for (const id of Object.keys(REGIONS)) {
      sc.resetStyle(id);
      sc.setHint(id, false);
      sc.setVisible(id, id !== 'turkey_1923');
    }
    if (lausanneRound || this.compare) sc.setVisible('turkey_1923', true);
    if (this.compare) {
      this.applyComparison(this.compareT);
    } else {
      // Anatolia question: hide its sub-regions so the whole shape can be picked
      if (this.phase === 'asking' && this.q?.region === 'turkey_1923') {
        for (const id of TURKEY_SUBREGIONS) sc.setVisible(id, false);
      }
      for (const [id, s] of Object.entries(this.solved)) sc.markSolved(id, s.treaty.accent);
    }
    this.refreshLabels();
  }

  refreshLabels() {
    const sc = this.scene;
    sc.clearLabels();
    if (this.compare) {
      for (const id of ['turkey_1923', 'syria_lebanon', 'iraq', 'hejaz', 'yemen']) {
        sc.showLabel(id, REGIONS[id].name.replace(/ \(.*\)/, ''), null);
      }
      return;
    }
    for (const [id, s] of Object.entries(this.solved)) {
      if (!sc.regions[id].visible) continue;
      sc.showLabel(id, REGIONS[id].name.replace(/ \(.*\)/, ''), s.treaty.accent);
    }
  }

  // ------------------------------------------------------------------ Lausanne comparison
  toggleCompare(force) {
    const on = force ?? !this.compare;
    if (on === this.compare) return;
    sound.click();
    this.compare = on;
    $('compareBtn').setAttribute('aria-pressed', String(on));
    $('compare').classList.toggle('hidden', !on);
    this.setDrawer(false);
    if (on) {
      this.prevPhase = this.phase;
      this.compareT = 0;
      $('cSlider').value = 0;
      $('prompt').classList.add('hidden');
      this.scene.setView('middle_east');
      this.markView('middle_east');
    } else {
      this.stopPlay();
      this.updatePrompt();
    }
    this.refreshStyles();
    if (!on && this.phase === 'asking') {
      this.updatePrompt();
      if ($('guideToggle').checked && this.q) this.scene.setView(this.q.view);
    }
  }

  applyComparison(t) {
    this.compareT = t;
    const sc = this.scene;
    const base = new THREE.Color('#5d7894');
    const turkey = new THREE.Color(TURKEY_COLOR);
    sc.setVisible('turkey_1923', true);
    sc.setStyle('turkey_1923', { color: base.clone().lerp(turkey, t), depth: 0.03 + 0.15 * t });
    for (const [id, col] of Object.entries(COMPARISON_REGION_STYLE)) {
      const c = new THREE.Color(col);
      if (RETURNED.includes(id)) {
        sc.setStyle(id, { color: c.clone().lerp(turkey, t), depth: 0.17 + 0.03 * t, solved: true });
      } else {
        sc.setStyle(id, { color: c, depth: 0.13, solved: true });
      }
    }
    $('cSlider').value = Math.round(t * 100);
    this.highlightRows(t);
  }

  highlightRows(t) {
    document.querySelectorAll('#cRows [data-row]').forEach((el) => {
      el.querySelector('.c-sevres').style.opacity = t < 0.5 ? '1' : '0.45';
      el.querySelector('.c-lausanne').style.opacity = t >= 0.5 ? '1' : '0.45';
    });
  }

  renderCompare() {
    $('cLegend').innerHTML = COMPARISON_LEGEND.map(([c, l]) => `<span class="inline-flex items-center gap-1"><i class="w-2.5 h-2.5 rounded-sm inline-block" style="background:${c}"></i>${esc(l)}</span>`).join('')
      + `<span class="inline-flex items-center gap-1"><i class="w-2.5 h-2.5 rounded-sm inline-block" style="background:${TURKEY_COLOR}"></i>Turkey</span>`;
    const icon = { gain: '✓', mixed: '≈', loss: '✗' };
    const tone = { gain: 'text-emerald-300', mixed: 'text-amber-300', loss: 'text-red-300' };
    $('cRows').innerHTML = COMPARISON.map((r, i) => `
      <button data-row="${i}" class="w-full text-left rounded-lg bg-white/5 hover:bg-white/10 p-2 text-xs">
        <div class="flex items-center gap-1.5 mb-1"><span class="font-semibold text-sm">${esc(r.topic)}</span><span class="ml-auto font-bold ${tone[r.outcome]}">${icon[r.outcome]}</span></div>
        <div class="grid grid-cols-2 gap-2">
          <div class="c-sevres text-cyan-100 transition-opacity"><span class="text-cyan-300 font-semibold">Sèvres:</span> ${esc(r.sevres)}</div>
          <div class="c-lausanne text-blue-100 transition-opacity"><span class="text-blue-300 font-semibold">Lausanne:</span> ${esc(r.lausanne)}</div>
        </div>
      </button>`).join('');
    document.querySelectorAll('#cRows [data-row]').forEach((el) => {
      el.onclick = () => {
        const row = COMPARISON[el.dataset.row];
        sound.click();
        if (row.region) {
          this.scene.focusRegion(row.region, 4.5);
          this.scene.bump(row.region);
        }
      };
    });
  }

  pickCompare(id) {
    if (!id) return;
    const row = COMPARISON.find((r) => r.region === id) ?? (ARAB_IDS.includes(id) ? COMPARISON.find((r) => r.topic === 'Arab provinces') : null);
    this.scene.bump(id);
    sound.click();
    if (row) this.openCompareCard(row);
    else this.toast(`${REGIONS[id].name} is outside the Sèvres/Lausanne settlement.`);
  }

  playCompare() {
    if (this.playing) return this.stopPlay();
    this.playing = true;
    $('cPlay').textContent = '⏸';
    let t = this.compareT >= 0.99 ? 0 : this.compareT;
    let last = performance.now();
    const step = (now) => {
      if (!this.playing) return;
      t = Math.min(1, t + (now - last) / 5000);
      last = now;
      this.applyComparison(t);
      if (t >= 1) this.stopPlay();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  stopPlay() {
    this.playing = false;
    $('cPlay').textContent = '▶';
  }

  // ------------------------------------------------------------------ small UI helpers
  toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (el.style.opacity = '0'), 2600);
  }

  floater(pos, text, bad) {
    if (!pos) return;
    const el = document.createElement('div');
    el.className = `floater${bad ? ' bad' : ''}`;
    el.textContent = text;
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
    $('floaters').appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}
