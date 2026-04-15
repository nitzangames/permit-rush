export const VERSION = 'v0.1.3';

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export const COLORS = {
  bg: '#0d1021',
  bgDeep: '#05070f',
  card: '#0a0e1f',
  cardAccent: '#3fd4ff',
  gridDot: '#1a2040',
  text: '#e0f0ff',
  textDim: '#6080a0',
  textBright: '#ffffff',
  approve: '#3fff8f',
  reject: '#ff5050',
  warn: '#ffb040',
  houseLine: '#3fd4ff',
  timerBar: '#3fd4ff',
  timerBarWarn: '#ff5050',
  flood: 'rgba(64, 128, 220, 0.18)',
  rulebookBg: '#080b18',
  rulebookAccent: '#2a4070',
  newRule: '#ffb040',
};

export const CONFIG = {
  MAX_LIVES: 3,
  INITIAL_TIMER: 8.0,
  MIN_TIMER: 3.0,
  TIMER_REDUCTION_PER_WAVE: 0.5,
  INVALID_RATIO: 0.5,
  STAMPS_PER_WAVE: 5,
  COMBO_MAX: 8,
  SPEED_BONUS_THRESHOLD: 2.0,
  SWIPE_COMMIT_DX: 220,
};

export const STATE = {
  MENU: 'MENU',
  BRIEFING: 'BRIEFING',
  PLAYING: 'PLAYING',
  STAMPING: 'STAMPING',
  DISASTER: 'DISASTER',
  GAMEOVER: 'GAMEOVER',
};
