import factory from "../factory";
import { $_ } from "./lexical";
import { Control } from "../../../node/cst/inline";

export const autoTagControls = ["#"];

export const paragraphItemControls = {
    Paragraph: ":paragraph:",
    Item: ":item:",
    Subitem1: ":subitem1:",
    Subitem2: ":subitem2:",
    Subitem3: ":subitem3:",
    Subitem4: ":subitem4:",
    Subitem5: ":subitem5:",
    Subitem6: ":subitem6:",
    Subitem7: ":subitem7:",
    Subitem8: ":subitem8:",
    Subitem9: ":subitem9:",
    Subitem10: ":subitem10:",
} as const;

export const appdxItemControls = {
    AppdxFig: ":appdx-fig:",
    AppdxStyle: ":appdx-style:",
    AppdxFormat: ":appdx-format:",
    AppdxTable: ":appdx-table:",
    AppdxNote: ":appdx-note:",
    Appdx: ":appdx:",
} as const;

export const supplProvisionAppdxItemControls = {
    SupplProvisionAppdx: ":suppl-provision-appdx:",
    SupplProvisionAppdxTable: ":suppl-provision-appdx-table:",
    SupplProvisionAppdxStyle: ":suppl-provision-appdx-style:",
} as const;

export const tagControls = {
    ...paragraphItemControls,
    ...appdxItemControls,
    ...supplProvisionAppdxItemControls,
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

export const $paragraphControl = makeTagControlRule("Paragraph");
export const $itemControl = makeTagControlRule("Item");
export const $subitem1Control = makeTagControlRule("Subitem1");
export const $subitem2Control = makeTagControlRule("Subitem2");
export const $subitem3Control = makeTagControlRule("Subitem3");
export const $subitem4Control = makeTagControlRule("Subitem4");
export const $subitem5Control = makeTagControlRule("Subitem5");
export const $subitem6Control = makeTagControlRule("Subitem6");
export const $subitem7Control = makeTagControlRule("Subitem7");
export const $subitem8Control = makeTagControlRule("Subitem8");
export const $subitem9Control = makeTagControlRule("Subitem9");
export const $subitem10Control = makeTagControlRule("Subitem10");

export const $appdxControl = makeTagControlRule("Appdx");
export const $appdxTableControl = makeTagControlRule("AppdxTable");
export const $appdxStyleControl = makeTagControlRule("AppdxStyle");
export const $appdxFormatControl = makeTagControlRule("AppdxFormat");
export const $appdxFigControl = makeTagControlRule("AppdxFig");
export const $appdxNoteControl = makeTagControlRule("AppdxNote");

export const $supplProvisionAppdxControl = makeTagControlRule("SupplProvisionAppdx");
export const $supplProvisionAppdxTableControl = makeTagControlRule("SupplProvisionAppdxTable");
export const $supplProvisionAppdxStyleControl = makeTagControlRule("SupplProvisionAppdxStyle");


