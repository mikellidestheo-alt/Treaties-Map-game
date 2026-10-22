// Tiny WebAudio synth so the game needs no audio assets.
let ctx = null;
let enabled = true;

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  if (!enabled) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {
    /* audio unavailable */
  }
}

export const sound = {
  get enabled() { return enabled; },
  set enabled(v) { enabled = v; },
  correct() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.28, 'triangle')); },
  wrong() { tone(196, 0, 0.25, 'sawtooth', 0.08); tone(147, 0.12, 0.3, 'sawtooth', 0.08); },
  click() { tone(660, 0, 0.06, 'square', 0.04); },
  fanfare() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.4, 'triangle')); },
};
