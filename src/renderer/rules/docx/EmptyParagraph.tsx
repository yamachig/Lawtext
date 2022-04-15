import React from "react";
import { w } from "./tags";

export const EmptyParagraph: React.FC = () => {
    return (
        <w.p>
            <w.pPr>
                <w.pStyle w:val="EmptyParagraph"/>
            </w.pPr>
        </w.p>
    );
};

export default EmptyParagraph;
