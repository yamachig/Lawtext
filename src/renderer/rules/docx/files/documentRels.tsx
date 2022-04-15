import React from "react";
import { makeComponentWithTag } from "../component";

const Relationships = makeComponentWithTag("Relationships");
const Relationship = makeComponentWithTag("Relationship");

export const documentRels = (
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml" />
    </Relationships>
);
export default documentRels;
