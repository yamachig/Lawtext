
export interface JsonEL {
    tag: string
    attr: { [key: string]: string | undefined }
    children: Array<JsonEL | string>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isJsonEL = (object: any): object is JsonEL => {
    return "tag" in object && "attr" in object && "children" in object;
};
