// src/hot-shim.ts
type AnyFn = (...args: any[]) => any
const noop: AnyFn = () => {}

const m = import.meta as any

// Если HMR нет (или это прод/preview), подставляем no-op реализацию
if (!m.hot) {
  m.hot = {
    on: noop,
    off: noop,
    once: noop,
    send: noop,
    accept: noop,
    dispose: noop,
    invalidate: noop,
    // иногда код использует события как add/removeEventListener
    addEventListener: noop,
    removeEventListener: noop,
  }
}