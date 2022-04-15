import React from "react";
import { w, wp, a, wps } from "./tags";

export const TextBoxRun: React.FC<React.PropsWithChildren<{id: string | number, name: string}>> = props => {

    return (<>
        <w.r>
            <w.drawing>
                <wp.inline distT="0" distB="0" distL="0" distR="0">
                    <wp.extent cx="0" cy="0" />
                    <wp.docPr id={props.id} name={props.name} />
                    <a.graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a.graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                            <wps.wsp>
                                <wps.cNvSpPr txBox="1">
                                    <a.spLocks noChangeArrowheads="1" />
                                </wps.cNvSpPr>
                                <wps.spPr bwMode="auto">
                                    <a.xfrm>
                                        <a.off x="0" y="0" />
                                    </a.xfrm>
                                    <a.prstGeom prst="rect">
                                        <a.avLst />
                                    </a.prstGeom>
                                    <a.noFill />
                                </wps.spPr>
                                <wps.txbx>
                                    <w.txbxContent>
                                        {props.children}
                                    </w.txbxContent>
                                </wps.txbx>
                                <wps.bodyPr rot="0" vert="horz" wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" anchor="t" anchorCtr="0">
                                    <a.spAutoFit />
                                </wps.bodyPr>
                            </wps.wsp>
                        </a.graphicData>
                    </a.graphic>
                </wp.inline>
            </w.drawing>
        </w.r>
    </>);
};

export default TextBoxRun;
