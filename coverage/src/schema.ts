import * as law_diff from "lawtext/dist/src/diff/law_diff";
import mongoose from "mongoose";
import { Era, LawCoverage, LawType } from "./lawCoverage";

type DeNull<T> = T extends null ? never : T;

export const lawCoverageSchema = new mongoose.Schema<LawCoverage>({
    LawID: { type: String, required: true, unique: true, index: true },
    LawNum: { type: String, required: true, index: true },
    LawTitle: { type: String, required: true },
    Enforced: { type: Boolean, required: true },
    Path: { type: String, required: true },
    XmlName: { type: String, required: true },

    Era: {
        type: String,
        enum: Object.values(Era),
        required: true,
        nullable: true,
    },
    Year: { type: Number, required: true, nullable: true },
    Num: { type: Number, required: true, nullable: true },
    LawType: {
        type: String,
        enum: Object.values(LawType),
        required: true,
        nullable: true,
    },
    updateDate: { type: Date, required: true },

    originalLaw: {
        required: true,
        nullable: true,
        type: new mongoose.Schema<LawCoverage["originalLaw"]>({
            ok: {
                required: true,
                nullable: true,
                type: new mongoose.Schema<DeNull<DeNull<LawCoverage["originalLaw"]>["ok"]>>({
                    requiredms: { type: mongoose.Schema.Types.Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    renderedHTML: {
        required: true,
        nullable: true,
        type: new mongoose.Schema<LawCoverage["renderedHTML"]>({
            ok: {
                required: true,
                nullable: true,
                type: new mongoose.Schema<DeNull<DeNull<LawCoverage["renderedHTML"]>["ok"]>>({
                    requiredms: { type: mongoose.Schema.Types.Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    renderedDocx: {
        required: true,
        nullable: true,
        type: new mongoose.Schema<LawCoverage["renderedDocx"]>({
            ok: {
                required: true,
                nullable: true,
                type: new mongoose.Schema<DeNull<DeNull<LawCoverage["renderedDocx"]>["ok"]>>({
                    requiredms: { type: mongoose.Schema.Types.Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    renderedLawtext: {
        required: true,
        nullable: true,
        type: new mongoose.Schema<LawCoverage["renderedLawtext"]>({
            ok: {
                required: true,
                nullable: true,
                type: new mongoose.Schema<DeNull<DeNull<LawCoverage["renderedLawtext"]>["ok"]>>({
                    requiredms: { type: mongoose.Schema.Types.Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    parsedLaw: {
        required: true,
        nullable: true,
        type: new mongoose.Schema<LawCoverage["parsedLaw"]>({
            ok: {
                required: true,
                nullable: true,
                type: new mongoose.Schema<DeNull<DeNull<LawCoverage["parsedLaw"]>["ok"]>>({
                    requiredms: { type: mongoose.Schema.Types.Map, of: Number, required: true },
                }, { minimize: false }),
            },
            hasError: { type: Boolean, required: true },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },

    lawDiff: {
        required: true,
        nullable: true,
        type: new mongoose.Schema<LawCoverage["lawDiff"]>({
            ok: {
                required: true,
                nullable: true,
                type: new mongoose.Schema<DeNull<DeNull<LawCoverage["lawDiff"]>["ok"]>>({
                    mostSeriousStatus: {
                        type: Number,
                        enum: Object.values(law_diff.ProblemStatus),
                        required: true,
                    },
                    result: {
                        required: true,
                        type: new mongoose.Schema<DeNull<DeNull<LawCoverage["lawDiff"]>["ok"]>["result"]>(
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
                    requiredms: { type: mongoose.Schema.Types.Map, of: Number, required: true },
                }, { minimize: false }),
            },
            info: { type: Object, required: true },
        }, { minimize: false }),
    },
}, { minimize: false });
