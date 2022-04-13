import React from "react";
import JSZip from "jszip";
import { renderToStaticMarkup } from "../common";
import { w } from "./component";
import contentTypes from "./files/contentTypes";
import rels from "./files/rels";
import documentRels from "./files/documentRels";
import styles from "./styles";

export const renderDocxAsync = (bodyEL: JSX.Element): Promise<Uint8Array | Buffer> => {
    const document = (
        <w.document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w.body>
                {bodyEL}
            </w.body>
        </w.document>
    );

    return new JSZip()
        .file(
            "[Content_Types].xml",
            /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(contentTypes)}
`,
        )
        .file(
            "_rels/.rels",
            /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(rels)}
`,
        )
        .file(
            "word/_rels/document.xml.rels",
            /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(documentRels)}
`,
        )
        .file(
            "word/document.xml",
            /*xml*/`\
<?xml version="1.0" encoding="utf-8"?>
${renderToStaticMarkup(document)}
`,
        )
        .file(
            "word/styles.xml",
            /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(styles)}
`,
        )
        .generateAsync({
            type: JSZip.support.nodebuffer ? "nodebuffer" : "uint8array",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9,
            },
        });
};
