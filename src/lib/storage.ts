type SessionKeyName =
  | 'config'
  | 'synopsis'
  | 'characters'
  | 'bible'
  | 'draftProjectId';

const STORAGE_KEYS: Record<SessionKeyName, string> = {
  config: 'inkforge_config',
  synopsis: 'inkforge_synopsis',
  characters: 'inkforge_characters',
  bible: 'inkforge_bible',
  draftProjectId: 'inkforge_draft_project_id',
};

const LEGACY_KEYS: Partial<Record<SessionKeyName, string>> = {
  config: 'mangaforge_config',
  synopsis: 'mangaforge_synopsis',
  characters: 'mangaforge_characters',
  bible: 'mangaforge_bible',
};

function inBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getSessionKey(name: SessionKeyName): string {
  return STORAGE_KEYS[name];
}

export function setSessionJSON<T>(name: SessionKeyName, value: T): void {
  if (!inBrowser()) return;
  sessionStorage.setItem(STORAGE_KEYS[name], JSON.stringify(value));
}

export function getSessionJSON<T>(name: SessionKeyName): T | null {
  if (!inBrowser()) return null;

  const primary = sessionStorage.getItem(STORAGE_KEYS[name]);
  if (primary) {
    try {
      return JSON.parse(primary) as T;
    } catch {
      return null;
    }
  }

  const legacyKey = LEGACY_KEYS[name];
  if (!legacyKey) return null;

  const legacy = sessionStorage.getItem(legacyKey);
  if (!legacy) return null;

  try {
    const parsed = JSON.parse(legacy) as T;
    // Migrate legacy key to new key.
    sessionStorage.setItem(STORAGE_KEYS[name], JSON.stringify(parsed));
    return parsed;
  } catch {
    return null;
  }
}

export function setSessionText(name: SessionKeyName, value: string): void {
  if (!inBrowser()) return;
  sessionStorage.setItem(STORAGE_KEYS[name], value);
}

export function getSessionText(name: SessionKeyName): string | null {
  if (!inBrowser()) return null;

  const current = sessionStorage.getItem(STORAGE_KEYS[name]);
  if (current) return current;

  const legacyKey = LEGACY_KEYS[name];
  if (!legacyKey) return null;

  const legacy = sessionStorage.getItem(legacyKey);
  if (legacy) {
    sessionStorage.setItem(STORAGE_KEYS[name], legacy);
  }
  return legacy;
}

export function clearCreationSession(): void {
  if (!inBrowser()) return;

  Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
  Object.values(LEGACY_KEYS).forEach((key) => {
    if (key) sessionStorage.removeItem(key);
  });
}
