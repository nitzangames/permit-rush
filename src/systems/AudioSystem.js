export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.muted = false;
  }
  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.enabled = false; return; }
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  _tone(freq, dur, type = 'sine', gain = 0.18, attack = 0.005) {
    if (!this.enabled || this.muted) return;
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  stampApprove() {
    this._tone(620, 0.09, 'square', 0.14);
    setTimeout(() => this._tone(940, 0.14, 'square', 0.14), 60);
  }
  stampReject() {
    this._tone(220, 0.22, 'sawtooth', 0.16);
    setTimeout(() => this._tone(140, 0.18, 'sawtooth', 0.14), 80);
  }
  disaster() {
    this._tone(90, 0.8, 'sawtooth', 0.28);
    setTimeout(() => this._tone(60, 0.7, 'sawtooth', 0.22), 120);
    setTimeout(() => this._tone(45, 0.6, 'square', 0.18), 220);
  }
  combo(n) {
    const base = 520 + Math.min(n, 12) * 60;
    this._tone(base, 0.08, 'triangle', 0.1);
    setTimeout(() => this._tone(base * 1.25, 0.12, 'triangle', 0.1), 50);
  }
  timerWarn() { this._tone(1100, 0.05, 'sine', 0.06); }
  click() { this._tone(800, 0.04, 'square', 0.08); }
}
