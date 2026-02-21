import { homedir } from "node:os";

const CONFIG_FILE = "config.json";
const USER_HOME = homedir();
const DEFAULT_LOCATIONS = [
  { name: "Project Data", path: "/home/hades/project/filemanager/data" },
  { name: "Ramadhan 2026", path: "/home/hades/2026-ramadhan" },
  { name: "Home Storage", path: USER_HOME },
];

export interface Location {
  name: string;
  path: string;
}

export interface Config {
  locations: Location[];
  activeLocationIndex: number;
}

// In-memory cache
let configCache: Config | null = null;

export async function loadConfig(): Promise<Config> {
  if (configCache) return configCache;

  try {
    const file = Bun.file(CONFIG_FILE);
    if (await file.exists()) {
      const data = await file.json();
      configCache = {
        locations: data.locations || DEFAULT_LOCATIONS,
        activeLocationIndex: data.activeLocationIndex ?? 0,
      };
    } else {
      configCache = {
        locations: DEFAULT_LOCATIONS,
        activeLocationIndex: 0,
      };
      await saveConfig(configCache);
    }
  } catch (e) {
    console.error("Failed to load config, using default", e);
    configCache = {
      locations: DEFAULT_LOCATIONS,
      activeLocationIndex: 0,
    };
  }

  return configCache;
}

export async function saveConfig(newConfig: Partial<Config>): Promise<Config> {
  const current = await loadConfig();
  const updated = { ...current, ...newConfig };

  await Bun.write(CONFIG_FILE, JSON.stringify(updated, null, 2));
  configCache = updated;

  return updated;
}

export async function getActiveLocation(): Promise<Location> {
  const config = await loadConfig();
  const location = config.locations[config.activeLocationIndex];
  if (location) return location;
  return DEFAULT_LOCATIONS[0] as Location;
}

export function getDataDir(): string {
  if (configCache) {
    const loc = configCache.locations[configCache.activeLocationIndex];
    if (loc) return loc.path;
  }
  return (DEFAULT_LOCATIONS[0] as Location).path;
}
