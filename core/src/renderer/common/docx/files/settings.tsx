import React from "react";
import { w } from "../tags";


export const settings = (
    <w.settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w.compat>
            <w.compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15" />
        </w.compat>
    </w.settings>
);
export default settings;
