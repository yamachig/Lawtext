import type fflate from "fflate";
import { unzip as fflateUnzip, zip as fflateZip, strToU8 } from "fflate";

export const unzip = (data: Uint8Array, opts?: fflate.AsyncUnzipOptions) => {
    return new Promise<fflate.Unzipped>((resolve, reject) => {
        fflateUnzip(data, opts ?? {}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export type AsyncZippableFile = Uint8Array | ArrayBuffer | AsyncZippable | string | [Uint8Array | ArrayBuffer | string | AsyncZippable, fflate.AsyncZipOptions];

export interface AsyncZippable {
    [path: string]: AsyncZippableFile;
}

const recursiveConvertToU8Inner = (file: Uint8Array | ArrayBuffer | AsyncZippable | string): Uint8Array | fflate.AsyncZippable => {
    if (typeof file === "string") {
        return strToU8(file);
    } else if (file instanceof ArrayBuffer) {
        return new Uint8Array(file);
    } else if (file instanceof Uint8Array) {
        return file;
    } else {
        return recursiveStrToU8(file);
    }
};

const recursiveStrToU8 = (data: AsyncZippable): fflate.AsyncZippable => {
    return Object.fromEntries(Object.entries(data).map(([path, file]) => {
        const retFile: fflate.AsyncZippableFile = (
            (Array.isArray(file))
                ? [
                    recursiveConvertToU8Inner(file[0]),
                    file[1],
                ]
                : recursiveConvertToU8Inner(file)
        );
        return [path, retFile];
    }));
};

export const zip = (data: AsyncZippable, opts?: fflate.AsyncZipOptions) => {
    return new Promise<Uint8Array>((resolve, reject) => {
        fflateZip(recursiveStrToU8(data), opts ?? {}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
