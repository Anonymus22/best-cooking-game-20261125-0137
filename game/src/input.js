// Keyboard and mouse state for the kitchen: WASD and the arrow keys walk the chef, E or Space
// works the nearest station, Enter starts and restarts, M mutes. A mouse click is remembered
// with its canvas position so the world can treat a clicked station as an order to work it.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.click = null;
    this.mouse = { x: 0, y: 0 };
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      if (!event.repeat) this.pressed.add(event.code);
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    canvas.addEventListener('pointermove', (event) => {
      this.mouse = this.toCanvas(event);
    });
    canvas.addEventListener('pointerdown', (event) => {
      this.click = this.toCanvas(event);
      this.mouse = this.click;
    });
  }

  /** Pointer position in canvas coordinates, undoing any CSS scaling of the canvas. */
  toCanvas(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * this.canvas.height,
    };
  }

  /** Movement direction from the held keys: -1, 0 or 1 on each axis. */
  direction() {
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    const up = this.keys.has('KeyW') || this.keys.has('ArrowUp');
    const down = this.keys.has('KeyS') || this.keys.has('ArrowDown');
    return { x: (right ? 1 : 0) - (left ? 1 : 0), y: (down ? 1 : 0) - (up ? 1 : 0) };
  }

  /** True once for each fresh press of any of `codes`; consumes the press. */
  takePress(...codes) {
    for (const code of codes) {
      if (this.pressed.has(code)) {
        this.pressed.delete(code);
        return true;
      }
    }
    return false;
  }

  /** The click since the last frame, if any; consumes it. */
  takeClick() {
    const click = this.click;
    this.click = null;
    return click;
  }

  /** Forget presses and clicks (on screen changes, so a start click does not also chop). */
  clearEdges() {
    this.pressed.clear();
    this.click = null;
  }
}
