/*
 * Common data boundary for future app migrations.
 * Current HTML apps keep their existing per-app localStorage keys and are not
 * wired to this module yet, so their behavior remains unchanged.
 */
export function createLocalStore({ key, version = 1, migrate = value => value }) {
  if (!key) throw new TypeError('A stable app-specific key is required.');
  return {
    async load() {
      try {
        const raw = localStorage.getItem(key);
        return raw ? migrate(JSON.parse(raw), version) : null;
      } catch (error) {
        console.warn(`Could not read local data for ${key}`, error);
        return null;
      }
    },
    async save(value) {
      localStorage.setItem(key, JSON.stringify({ version, value }));
      return value;
    },
    async export() {
      const value = await this.load();
      return new Blob([JSON.stringify({ format: key, version, exportedAt: new Date().toISOString(), value }, null, 2)], { type: 'application/json' });
    },
    async import(file) {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || !('value' in data)) throw new TypeError('Unsupported backup format.');
      return this.save(migrate(data.value, version));
    }
  };
}

// A future authenticated adapter can implement the same load/save contract.
// Keep null until authentication, access rules, and conflict handling exist.
export function attachSyncAdapter(localStore, syncAdapter = null) {
  return {
    async load() { return syncAdapter ? syncAdapter.load() : localStore.load(); },
    async save(value) {
      await localStore.save(value);
      if (syncAdapter) await syncAdapter.save(value);
      return value;
    }
  };
}
