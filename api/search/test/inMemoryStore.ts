import { Store } from "../src/store";

export class InMemoryStore extends Store {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public db: Map<string, any>;

    public constructor() {
        super();
        this.db = new Map();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public get(keys: string[]): Promise<Record<string, any>> {
        return (async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ret: Record<string, any> = {};
            for (const key of keys) {
                if (this.db.has(key)) ret[key] = this.db.get(key);
            }
            return ret;
        })();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public set(items: { [key: string]: Record<string, any>; }): Promise<unknown> {
        return (async () => {
            for (const [key, value] of Object.entries(items)) {
                this.db.set(key, value);
            }
        })();
    }

    public getKeys(): Promise<string[]> {
        return (async () => {
            return Array.from(this.db.keys());
        })();
    }

    public delete(keys: string[]): Promise<unknown> {
        return (async () => {
            for (const key of keys) {
                this.db.delete(key);
            }
        })();
    }

    public empty(): Promise<unknown> {
        return (async () => {
            this.db.clear();
        })();
    }

}
