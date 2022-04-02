import factory from "../factory";
import { $_ } from "./lexical";
import { Control } from "../../../node/cst/inline";

export const autoTagControls = ["#"];

export const appdxItemControl = {
    AppdxFig: ":appdx-fig:",
    AppdxStyle: ":appdx-style:",
    AppdxFormat: ":appdx-format:",
    AppdxTable: ":appdx-table:",
    AppdxNote: ":appdx-note:",
    Appdx: ":appdx:",
} as const;

export const supplProvisionAppdxItemControl = {
    SupplProvisionAppdx: ":suppl-provision-appdx:",
    SupplProvisionAppdxTable: ":suppl-provision-appdx-table:",
    SupplProvisionAppdxStyle: ":suppl-provision-appdx-style:",
} as const;

export const tagControls = {
    ...appdxItemControl,
    ...supplProvisionAppdxItemControl,
};

const makeTagControlRule = <
    TTag extends (keyof typeof tagControls),
>(
        tag: TTag,
    ) => {
    const control = tagControls[tag];
    const controlPtn = new RegExp(`^${control}`);
    return factory
        .sequence(s => s
            .and(r => r
                .sequence(s => s
                    .and(r => r.regExp(controlPtn), "value")
                    .action(({ value, range }) => ({ value, range: range() }))
                )
            , "control")
            .and(r => r
                .sequence(s => s
                    .and(() => $_, "value")
                    .action(({ value, range }) => ({ value, range: range() }))
                )
            , "trailingSpace")
            .action(({ control, trailingSpace }) => {
                return {
                    tag,
                    control: new Control(
                        control.value,
                        control.range,
                        trailingSpace.value,
                        trailingSpace.range,
                    ),
                } as const;
            })
        );
};

export const $autoTagControl = factory
    .withName("autoTagControl")
    .sequence(s => s
        .and(r => r
            .sequence(s => s
                .and(r => r.oneOf(autoTagControls), "value")
                .action(({ value, range }) => ({ value, range: range() }))
            )
        , "control")
        .and(r => r
            .sequence(s => s
                .and(() => $_, "value")
                .action(({ value, range }) => ({ value, range: range() }))
            )
        , "trailingSpace")
        .action(({ control, trailingSpace }) => {
            return new Control(
                control.value,
                control.range,
                trailingSpace.value,
                trailingSpace.range,
            );
        })
    );

export const $appdxControl = makeTagControlRule("Appdx");
export const $appdxTableControl = makeTagControlRule("AppdxTable");
export const $appdxStyleControl = makeTagControlRule("AppdxStyle");
export const $appdxFormatControl = makeTagControlRule("AppdxFormat");
export const $appdxFigControl = makeTagControlRule("AppdxFig");
export const $appdxNoteControl = makeTagControlRule("AppdxNote");

export const $supplProvisionAppdxControl = makeTagControlRule("SupplProvisionAppdx");
export const $supplProvisionAppdxTableControl = makeTagControlRule("SupplProvisionAppdxTable");
export const $supplProvisionAppdxStyleControl = makeTagControlRule("SupplProvisionAppdxStyle");


