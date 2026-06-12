// Synthesized ambient audio — no asset files. Everything is generated:
// brown-noise room tone, filtered-noise card slides, a low orb hum.
// Off by default; first enable happens inside a user gesture.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let roomTone: AudioBufferSourceNode | null = null;
let hum: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function brownNoiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
}

export function startAmbience() {
  const c = ensureContext();
  if (roomTone) return;
  const src = c.createBufferSource();
  src.buffer = brownNoiseBuffer(c, 4);
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 220;
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.018, c.currentTime + 1.5);
  src.connect(lp).connect(g).connect(master!);
  src.start();
  roomTone = src;
  (roomTone as any).__gain = g;
}

export function stopAmbience() {
  if (!ctx || !roomTone) return;
  const g = (roomTone as any).__gain as GainNode;
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  const src = roomTone;
  roomTone = null;
  setTimeout(() => src.stop(), 500);
  stopHum();
}

export function cardSlide() {
  if (!ctx || !roomTone) return; // only when ambience is on
  const c = ctx;
  const src = c.createBufferSource();
  src.buffer = brownNoiseBuffer(c, 0.18);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 900 + Math.random() * 500;
  bp.Q.value = 0.8;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  src.connect(bp).connect(g).connect(master!);
  src.start(t);
  src.stop(t + 0.2);
}

export function startHum() {
  if (!ctx || !roomTone || hum) return;
  const c = ctx;
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = 68;
  osc2.frequency.value = 68.7; // slow beat between the pair
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.012, c.currentTime + 1.2);
  osc1.connect(g);
  osc2.connect(g);
  g.connect(master!);
  osc1.start();
  osc2.start();
  hum = { osc1, osc2, gain: g };
}

export function stopHum() {
  if (!ctx || !hum) return;
  const h = hum;
  hum = null;
  h.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  setTimeout(() => {
    h.osc1.stop();
    h.osc2.stop();
  }, 700);
}
