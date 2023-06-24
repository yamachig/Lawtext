/**
 * JsonEL: a tree structure that represents simplified structure of XML. A JsonEL object corresponds to an XML element.
 */
export interface JsonEL {
    /** The tag name of the element */
    tag: string;

    /** The attributes of the element */
    attr: Record<string, string | undefined>;

    /** The children of the element */
    children: (JsonEL | string)[];
}
