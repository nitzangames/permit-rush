export class InputHandler {
  constructor(canvas, cm) {
    this.cm = cm;
    this.listeners = {};
    this.dragging = false;
    this.start = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };

    const down = (cx, cy) => {
      const p = cm.screenToCanvas(cx, cy);
      this.dragging = true;
      this.start = p;
      this.current = p;
      this._emit('dragStart', p);
    };
    const move = (cx, cy) => {
      if (!this.dragging) return;
      const p = cm.screenToCanvas(cx, cy);
      this.current = p;
      this._emit('dragMove', { start: this.start, current: p, dx: p.x - this.start.x, dy: p.y - this.start.y });
    };
    const up = (cx, cy) => {
      if (!this.dragging) return;
      const p = cm.screenToCanvas(cx, cy);
      this.dragging = false;
      const dx = p.x - this.start.x;
      const dy = p.y - this.start.y;
      this._emit('dragEnd', { start: this.start, end: p, dx, dy });
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        this._emit('tap', p);
      }
    };

    canvas.addEventListener('mousedown', (e) => down(e.clientX, e.clientY));
    canvas.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    canvas.addEventListener('mouseup', (e) => up(e.clientX, e.clientY));
    canvas.addEventListener('mouseleave', (e) => { if (this.dragging) up(e.clientX, e.clientY); });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0]; down(t.clientX, t.clientY);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0]; move(t.clientX, t.clientY);
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0]; up(t.clientX, t.clientY);
    }, { passive: false });
  }
  on(evt, fn) { (this.listeners[evt] ||= []).push(fn); }
  _emit(evt, data) { (this.listeners[evt] || []).forEach(fn => fn(data)); }
}
