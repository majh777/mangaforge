import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { InkForgeDb } from '@/lib/types';

const DB_DIR = path.join(process.cwd(), '.inkforge');
const DB_FILE = path.join(DB_DIR, 'db.json');

const EMPTY_DB: InkForgeDb = {
  projects: [],
  showcase: [],
  usage: {},
  shareIndex: {},
};

declare global {
  // eslint-disable-next-line no-var
  var __inkforgeDbCache: InkForgeDb | undefined;
  // eslint-disable-next-line no-var
  var __inkforgeDbWriteQueue: Promise<void> | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function ensureDbFile(): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), 'utf-8');
  }
}

export async function readDb(): Promise<InkForgeDb> {
  if (global.__inkforgeDbCache) {
    return clone(global.__inkforgeDbCache);
  }

  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, 'utf-8');

  try {
    const parsed = JSON.parse(raw) as InkForgeDb;
    const normalized: InkForgeDb = {
      ...EMPTY_DB,
      ...parsed,
      projects: parsed.projects ?? [],
      showcase: parsed.showcase ?? [],
      usage: parsed.usage ?? {},
      shareIndex: parsed.shareIndex ?? {},
    };
    global.__inkforgeDbCache = normalized;
    return clone(normalized);
  } catch {
    global.__inkforgeDbCache = EMPTY_DB;
    return clone(EMPTY_DB);
  }
}

export async function writeDb(db: InkForgeDb): Promise<void> {
  global.__inkforgeDbCache = clone(db);

  const queue = global.__inkforgeDbWriteQueue ?? Promise.resolve();
  global.__inkforgeDbWriteQueue = queue.then(async () => {
    await ensureDbFile();
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  });

  await global.__inkforgeDbWriteQueue;
}

export async function mutateDb<T>(mutator: (db: InkForgeDb) => T | Promise<T>): Promise<T> {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function createSlug(seed: string): string {
  const base = seed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base || 'inkforge-project'}-${suffix}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
