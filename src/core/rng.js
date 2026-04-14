// Simple seeded PRNG (mulberry32). Use rng() in place of Math.random() for
// any code that should be reproducible from a seed.
let state = 1;

export function setSeed(s) {
  state = (s >>> 0) || 1;
}

export function getSeed() { return state; }

export function rng() {
  state = (state + 0x6D2B79F5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function pickSeedFromURL() {
  try {
    const p = new URLSearchParams(location.search);
    const s = parseInt(p.get('seed') || '', 10);
    if (Number.isFinite(s) && s > 0) return s;
  } catch {}
  return (Math.floor(Math.random() * 0xFFFFFFFF) >>> 0) || 1;
}
