export class StateMachine {
  constructor(initial) {
    this.state = initial;
    this.prev = null;
    this.listeners = {};
  }
  on(event, fn) {
    (this.listeners[event] ||= []).push(fn);
  }
  set(next) {
    if (next === this.state) return;
    this.prev = this.state;
    this.state = next;
    (this.listeners['change'] || []).forEach(fn => fn({ prev: this.prev, next }));
  }
  is(s) { return this.state === s; }
}
