export const wait = (ms: number): Promise<void> => {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
};

export const withTime = <TArgs extends unknown[], TRet>(func: (...args: TArgs) => TRet | Promise<TRet>) =>
    async (...args: TArgs): Promise<[time: number, ret: TRet]> => {
        const start = new Date();
        const ret = await func(...args);
        const end = new Date();
        const time = end.getTime() - start.getTime();
        return [time, ret];
    };

export function* range(start: number, end: number): Generator<number, void, unknown> {
    for (let i = start; i < end; i++) {
        yield i;
    }
}

export type ResolvedType<T> = T extends PromiseLike<infer U> ? U : T;

export const pick = <T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> => {
    const ret = {} as Pick<T, K>;
    for (const key of keys) ret[key] = obj[key];
    return ret;
};
export const omit = <T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
    const ret = { ...obj } as T;
    for (const key of keys) delete ret[key];
    return ret;
};

export const decodeBase64 = (base64: string): Uint8Array => {
    const binary = Buffer.from(base64, "base64");
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buf[i] = binary[i];
    }
    return buf;
};
export class NotImplementedError extends Error {
    constructor(message: string) {
        super(`NotImplemented: ${message}`);
    }
}

export const throwError = (): never => {
    throw new Error();
};

export const assertNever = (x: never): never => {
    throw new Error(`Unexpected ${typeof x} object: \r\n${JSON.stringify(x, undefined, 2)}`);
};

export type Diff<T, U> = T extends U ? never : T;


export const pictMimeDict = {
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
} as const;

export const throttle = <TArgs extends unknown[]>(func: (...args: TArgs) => unknown, waitms: number, initialWaitms?: number) => {
    let timer: NodeJS.Timeout| undefined = undefined;
    const lastArgsObj: {args?: TArgs} = {};
    const dispatchLastArgs = () => {
        if (lastArgsObj.args) {
            const args = lastArgsObj.args;
            lastArgsObj.args = undefined;
            func(...args);
            timer = setTimeout(dispatchLastArgs, waitms);
        } else {
            timer = undefined;
        }
    };
    return (...args: TArgs) => {
        lastArgsObj.args = args;
        if (timer === undefined) {
            timer = setTimeout(dispatchLastArgs, initialWaitms ?? waitms);
        }
    };
};
