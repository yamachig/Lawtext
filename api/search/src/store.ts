export abstract class Store {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract get(keys: string[]): Promise<Record<string, any>>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract set(items: {[key: string]: Record<string, any>}): Promise<unknown>;

    public abstract getKeys(): Promise<string[]>;

    public abstract delete(keys: string[]): Promise<unknown>;

    public abstract empty(): Promise<unknown>;
}

export type InvIndex = Record<string, {items: {[key: string]: number[]}}>;
export type Aliases = Record<string, {items: string[]}>;
export interface Stores {
    lawInfos: Store,
    aliases: Store,
    invIndex: Store,
}
