import React from "react";
import { renderToStaticMarkup } from "..";
import { w } from "./tags";
import styles from "./styles";
import { DOCXOptions, Relationships, Types } from "./component";
import { makePDFOLE } from "./ole";
import { AsyncZippable, zip } from "../../../util/zip";

export const renderDocxAsync = async (bodyEL: JSX.Element, docxOptions?: DOCXOptions): Promise<Uint8Array | Buffer> => {

    const media: {Id: string, Type: string, fileName: string, buf: ArrayBuffer}[] = [];
    const embeddings: {Id: string, Type: string, fileName: string, buf: ArrayBuffer}[] = [];
    const types = new Map<string, string>();

    const figDataManager = docxOptions?.figDataManager;
    if (figDataManager) {
        for (const [, figData] of figDataManager.getFigDataItems()) {

            if ("image" in figData) {
                media.push({
                    Id: figData.image.rId,
                    Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                    fileName: figData.image.name,
                    buf: figData.image.blob.buf,
                });
                types.set(figData.image.name.split(".").slice(-1)[0], figData.image.blob.type);

            }

            if ("file" in figData) {
                embeddings.push({
                    Id: figData.file.rId,
                    Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject",
                    fileName: `${figData.file.name}.bin`,
                    buf: makePDFOLE(figData.file.blob.buf),
                });
                types.set("bin", "application/vnd.openxmlformats-officedocument.oleObject");
                if (!media.find(m => m.Id === figDataManager.pdfIcon.rId)) {
                    media.push({
                        Id: figDataManager.pdfIcon.rId,
                        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                        fileName: figDataManager.pdfIcon.fileName,
                        buf: figDataManager.pdfIcon.buf,
                    });
                    types.set("emf", "image/x-emf");
                }
            }

            if ("pages" in figData) {
                for (const page of figData.pages) {
                    media.push({
                        Id: page.rId,
                        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                        fileName: page.name,
                        buf: page.blob.buf,
                    });
                    types.set(page.name.split(".").slice(-1)[0], page.blob.type);
                }
            }
        }
    }

    types.set("rels", "application/vnd.openxmlformats-package.relationships+xml");
    types.set("xml", "application/xml");

    const document = (
        <w.document
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:v="urn:schemas-microsoft-com:vml"
        >
            <w.body>
                {bodyEL}
            </w.body>
        </w.document>
    );

    const zipData: AsyncZippable = {};

    zipData["[Content_Types].xml"] = /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(<Types types={[
        { tag: "Override", PartName: "/word/document.xml", ContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" },
        { tag: "Override", PartName: "/word/styles.xml", ContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml" },
        { tag: "Override", PartName: "/word/settings.xml", ContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml" },
        { tag: "Override", PartName: "/word/fontTable.xml", ContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml" },
        ...([...types.entries()].map(([ext, type]) => ({
            tag: "Default" as const,
            Extension: ext,
            ContentType: type,
        }))),
    ]} />)}
`;

    zipData["_rels/.rels"] = /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(<Relationships relationships={[{ Id: "rId1", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", Target: "word/document.xml" }]} />)}
`;

    zipData["word/_rels/document.xml.rels"] = /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(<Relationships
        relationships={[
            { Id: "rId1", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", Target: "styles.xml" },
            { Id: "rId2", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings", Target: "settings.xml" },
            ...(media.map(m => ({
                Id: m.Id,
                Type: m.Type,
                Target: `media/${m.fileName}`,
            }))),
            ...(embeddings.map(m => ({
                Id: m.Id,
                Type: m.Type,
                Target: `embeddings/${m.fileName}`,
            }))),
        ]}
    />)}
`;

    for (const m of media) {
        zipData[`word/media/${m.fileName}`] = m.buf;
    }

    for (const m of embeddings) {
        zipData[`word/embeddings/${m.fileName}`] = m.buf;
    }

    zipData["word/document.xml"] = /*xml*/`\
<?xml version="1.0" encoding="utf-8"?>
${renderToStaticMarkup(document)}
`;

    zipData["word/styles.xml"] = /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup(styles)}
`;

    zipData["word/settings.xml"] = /*xml*/`\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
${renderToStaticMarkup((
        <w.settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w.compat>
                <w.compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15" />
            </w.compat>
        </w.settings>
    ))}
`;

    const zipBuf = await zip(zipData, { level: 9 });

    return zipBuf;
};
