import { CONFIG } from '../core/constants.js';
import { generateBlueprint } from '../data/blueprintGenerator.js';
import { getActiveRules, getNewRulesForWave } from '../data/rules.js';
import { setSeed, pickSeedFromURL } from '../core/rng.js';

const HISCORE_KEY = 'permitrush_hiscore';

export class GameSession {
  constructor() { this.reset(); }

  reset() {
    this.seed = pickSeedFromURL();
    setSeed(this.seed);
    this.cardIndex = 0;
    this.score = 0;
    this.combo = 0;
    this.comboMult = 1;
    this.lives = CONFIG.MAX_LIVES;
    this.correctStamps = 0;
    this.totalStamps = 0;
    this.wrongStamps = 0;
    this.wave = 1;
    this.timer = CONFIG.INITIAL_TIMER;
    this.timerMax = CONFIG.INITIAL_TIMER;
    this.activeBlueprint = null;
    this.lastDisaster = null;
    this.newRulesBanner = null;
    this.cardStart = 0;
    this.fastestDecision = Infinity;
  }

  currentTimerMax() {
    return Math.max(CONFIG.MIN_TIMER, CONFIG.INITIAL_TIMER - (this.wave - 1) * CONFIG.TIMER_REDUCTION_PER_WAVE);
  }

  nextBlueprint() {
    this.cardIndex++;
    this.activeBlueprint = generateBlueprint(this.wave, this.cardIndex);
    this.activeBlueprint.seed = this.seed;
    if (typeof window !== 'undefined') window.__debugBp = this.activeBlueprint;
    this.timerMax = this.currentTimerMax();
    this.timer = this.timerMax;
    this.cardStart = performance.now();
  }

  activeRules() { return getActiveRules(this.wave); }

  decide(action) {
    const bp = this.activeBlueprint;
    const invalid = bp.violations.length > 0;
    let correct;
    if (action === 'timeout') {
      correct = false;
    } else {
      correct = invalid ? action === 'reject' : action === 'approve';
    }

    this.totalStamps++;
    const elapsed = (performance.now() - this.cardStart) / 1000;

    if (correct) {
      this.combo++;
      this.comboMult = Math.min(CONFIG.COMBO_MAX, 1 + Math.floor(this.combo / 2));
      const speedBonus = elapsed < CONFIG.SPEED_BONUS_THRESHOLD ? 50 : 0;
      const base = 100;
      this.score += (base + speedBonus) * this.comboMult;
      this.correctStamps++;
      this.fastestDecision = Math.min(this.fastestDecision, elapsed);

      const targetWave = 1 + Math.floor(this.correctStamps / CONFIG.STAMPS_PER_WAVE) * 2;
      if (targetWave > this.wave && targetWave <= 9) {
        this.wave = targetWave;
        const nr = getNewRulesForWave(this.wave);
        if (nr.length > 0) this.newRulesBanner = { rules: nr, ttl: 3.2 };
      }
    } else {
      this.combo = 0;
      this.comboMult = 1;
      this.lives--;
      this.wrongStamps++;
      this.lastDisaster = {
        violations: bp.violations.slice(),
        action,
        invalid,
        kind: this._disasterKind(bp),
        ttl: 1.2,
      };
    }

    return { correct, gameover: this.lives <= 0, action, invalid };
  }

  _disasterKind(bp) {
    if (bp.violations.includes('R05') || bp.zone === 'flood') return 'flood';
    if (bp.violations.includes('R01') || bp.violations.includes('R08') || bp.violations.includes('R06')) return 'collapse';
    if (bp.violations.includes('R02') || bp.violations.includes('R07')) return 'fire';
    return 'blackout';
  }

  tick(dt) {
    if (this.activeBlueprint) this.timer -= dt;
    if (this.newRulesBanner) {
      this.newRulesBanner.ttl -= dt;
      if (this.newRulesBanner.ttl <= 0) this.newRulesBanner = null;
    }
    if (this.lastDisaster && this.lastDisaster.ttl > 0) {
      this.lastDisaster.ttl -= dt;
    }
  }

  getHiScore() {
    try {
      if (typeof window !== 'undefined' && window.PlaySDK && window.PlaySDK.load) {
        const v = window.PlaySDK.load('hiscore');
        const n = parseInt(v || '0', 10);
        if (!isNaN(n)) return n;
      }
    } catch {}
    return parseInt(localStorage.getItem(HISCORE_KEY) || '0', 10);
  }
  saveHiScore() {
    const hi = this.getHiScore();
    if (this.score > hi) {
      try { localStorage.setItem(HISCORE_KEY, String(this.score)); } catch {}
      try {
        if (typeof window !== 'undefined' && window.PlaySDK && window.PlaySDK.save) {
          window.PlaySDK.save('hiscore', String(this.score));
        }
      } catch {}
      return true;
    }
    return false;
  }
}
