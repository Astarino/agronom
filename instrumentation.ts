export async function register() {
  // Node.js 22 иногда определяет localStorage с неполным API
  if (typeof localStorage === "undefined" || typeof localStorage.getItem !== "function") {
    (globalThis as unknown as Record<string, unknown>).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
  }
}
