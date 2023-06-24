import React from "react";
import { makeComponentWithTag } from "../component";

const Relationships = makeComponentWithTag("Relationships");
const Relationship = makeComponentWithTag("Relationship");

export const rels = (
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>
);
export default rels;
