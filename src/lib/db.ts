import Dexie, { type EntityTable } from 'dexie';

interface Settings {
  key: string;
  value: string;
}

interface RecentFile {
  id?: number;
  path: string;
  name: string;
  accessedAt: Date;
}

const db = new Dexie('FileMagnetDB') as Dexie & {
  settings: EntityTable<Settings, 'key'>;
  recentFiles: EntityTable<RecentFile, 'id'>;
};

db.version(1).stores({
  settings: 'key',
  recentFiles: '++id, path, accessedAt',
});

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.settings.get(key);
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

export async function addRecentFile(path: string, name: string): Promise<void> {
  await db.recentFiles.put({ path, name, accessedAt: new Date() });
}

export async function getRecentFiles(limit = 10): Promise<RecentFile[]> {
  return await db.recentFiles
    .orderBy('accessedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export { db };
export type { Settings, RecentFile };
