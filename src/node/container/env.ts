import { Container } from ".";
import { EL } from "../el";

export class Env {
    public lawType: string;
    public parents: EL[];

    private containerCache: Container | null;

    constructor(
        lawType: string,
        container: Container | null = null,
        parents: EL[] = [],
    ) {
        this.lawType = lawType;
        this.containerCache = container;
        this.parents = parents;
    }

    get container(): Container {
        if (!this.containerCache) throw new Error();
        return this.containerCache;
    }

    set container(container: Container) {
        this.containerCache = container;
    }

    public addContainer(container: Container): void {
        if (this.containerCache) {
            this.containerCache.addChild(container);
        }
        this.containerCache = container;
    }

    public copy(): Env {
        return new Env(
            this.lawType,
            this.containerCache,
            this.parents.slice(),
        );
    }
}
