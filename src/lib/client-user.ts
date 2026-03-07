const USER_ID_KEY = 'inkforge_user_id';

function randomId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `user_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function getClientUserId(): string {
  if (typeof window === 'undefined') return 'server';

  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const created = randomId();
  localStorage.setItem(USER_ID_KEY, created);
  return created;
}
