declare module "dexie" {
  export type EntityTable<T, Key extends keyof T> = {
    get(key: T[Key]): Promise<T | undefined>;
    put(value: T): Promise<unknown>;
    orderBy(field: keyof T): {
      reverse(): {
        limit(count: number): {
          toArray(): Promise<T[]>;
        };
      };
    };
  };

  export default class Dexie {
    constructor(name: string);
    version(versionNumber: number): {
      stores(schema: Record<string, string>): void;
    };
  }
}
