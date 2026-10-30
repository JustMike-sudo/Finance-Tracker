// The store persists to localStorage, which doesn't exist in Node.
const data = new Map();
globalThis.localStorage = {
  getItem: (k) => (data.has(k) ? data.get(k) : null),
  setItem: (k, v) => data.set(k, String(v)),
  removeItem: (k) => data.delete(k),
  clear: () => data.clear(),
};
globalThis.window = globalThis; // zustand's default storage reads window.localStorage
