import * as law_diff from "@coresrc/diff/law_diff";
import mongoose from "mongoose";
import { Era, LawCoverage, LawType } from "./lawCoverage";

export const lawCoverageSchema = new mongoose.Schema<LawCoverage>({
    LawID: { type: String, required: true, unique: true },
    LawNum: { type: String, required: true },
    LawTitle: { type: String, required: true },
    Enforced: { type: Boolean, required: true },
    Path: { type: String, required: true },
    XmlName: { type: String, required: true },

    Era: {
        type: String,
        enum: Object.values(Era),
        required: false,
    },
    Year: { type: Number, required: false },
    Num: { type: Number, required: false },
    LawType: {
        type: String,
        enum: Object.values(LawType),
        required: false,
    },
    updateDate: { type: Date, required: true },

    originalLaw: {
        required: false,
        type: new mongoose.Schema<LawCoverage["originalLaw"]>({
            ok: {
                required: false,
                type: new mongoose.Schema<Required<LawCoverage>["originalLaw"]["ok"]>({
                    requiredms: { type: Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    renderedLawtext: {
        required: false,
        type: new mongoose.Schema<LawCoverage["renderedLawtext"]>({
            ok: {
                required: false,
                type: new mongoose.Schema<Required<LawCoverage>["renderedLawtext"]["ok"]>({
                    requiredms: { type: Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    parsedLaw: {
        required: false,
        type: new mongoose.Schema<LawCoverage["parsedLaw"]>({
            ok: {
                required: false,
                type: new mongoose.Schema<Required<LawCoverage>["parsedLaw"]["ok"]>({
                    requiredms: { type: Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    lawDiff: {
        required: false,
        type: new mongoose.Schema<LawCoverage["lawDiff"]>({
            ok: {
                required: false,
                type: new mongoose.Schema<Required<LawCoverage>["lawDiff"]["ok"]>({
                    mostSeriousStatus: {
                        type: Number,
                        enum: Object.values(law_diff.ProblemStatus),
                        required: true,
                    },
                    result: {
                        required: true,
                        type: new mongoose.Schema<Required<Required<LawCoverage>["lawDiff"]>["ok"]["result"]>(
                            {
                                items: {
                                    type: [],
                                    required: true,
                                    minimize: false,
                                },
                                totalCount: { type: Number, required: true },
                            },
                            { minimize: false },
                        ),
                    },
                    requiredms: { type: Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },
}, { minimize: false });
