import { CANVAS_W, CANVAS_H } from './constants.js';

export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => this.resize());
  }
  resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetRatio = CANVAS_W / CANVAS_H;
    const viewRatio = vw / vh;
    let w, h;
    if (viewRatio > targetRatio) {
      h = vh;
      w = vh * targetRatio;
    } else {
      w = vw;
      h = vw / targetRatio;
    }
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
  }
  screenToCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (CANVAS_W / rect.width),
      y: (clientY - rect.top) * (CANVAS_H / rect.height),
    };
  }
}
