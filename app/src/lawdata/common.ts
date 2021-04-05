import { BaseLawtextLawDataProps, BaseXMLLawDataProps, LawDataCore } from "@coresrc/data/lawdata";

export interface StoredLawDataProps extends BaseXMLLawDataProps {
    source: "stored",
    lawPath: string,
}
export const isStoredLawDataProps = (props: LawDataProps):
    props is StoredLawDataProps =>
    props.source === "stored";

export interface ElawsLawDataProps extends BaseXMLLawDataProps {
    source: "elaws",
    pict: Map<string, Blob> | null,
}
export const isElawsLawDataProps = (props: LawDataProps):
    props is ElawsLawDataProps =>
    props.source === "elaws";

export interface TempXMLLawDataProps extends BaseXMLLawDataProps {
    source: "temp_xml",
}
export const isTempXMLLawDataProps = (props: LawDataProps):
    props is TempXMLLawDataProps =>
    props.source === "temp_xml";

export interface FileXMLLawDataProps extends BaseXMLLawDataProps {
    source: "file_xml",
}
export const isFileXMLLawDataProps = (props: LawDataProps):
    props is FileXMLLawDataProps =>
    props.source === "file_xml";

export interface TempLawtextLawDataProps extends BaseLawtextLawDataProps {
    source: "temp_lawtext",
}
export const isTempLawtextLawDataProps = (props: LawDataProps):
    props is TempLawtextLawDataProps =>
    props.source === "temp_lawtext";

export interface FileLawtextLawDataProps extends BaseLawtextLawDataProps {
    source: "file_lawtext",
}
export const isFileLawtextLawDataProps = (props: LawDataProps):
    props is FileLawtextLawDataProps =>
    props.source === "file_lawtext";

export type LawDataProps = StoredLawDataProps | ElawsLawDataProps | TempXMLLawDataProps | FileXMLLawDataProps | TempLawtextLawDataProps | FileLawtextLawDataProps;

export type LawData = LawDataProps & LawDataCore;
