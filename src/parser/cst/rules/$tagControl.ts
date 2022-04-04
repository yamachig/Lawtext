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

export const anonymParagraphItemControls = {
    Paragraph: ":anonym-paragraph:",
    Item: ":anonym-item:",
    Subitem1: ":anonym-subitem1:",
    Subitem2: ":anonym-subitem2:",
    Subitem3: ":anonym-subitem3:",
    Subitem4: ":anonym-subitem4:",
    Subitem5: ":anonym-subitem5:",
    Subitem6: ":anonym-subitem6:",
    Subitem7: ":anonym-subitem7:",
    Subitem8: ":anonym-subitem8:",
    Subitem9: ":anonym-subitem9:",
    Subitem10: "anonym-subitem10:",
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

// export const tagControls = {
//     ...paragraphItemControls,
//     ...appdxItemControls,
//     ...supplProvisionAppdxItemControls,
// };

const makeTagControlRule = <
    TTag extends string,
>(
        tag: TTag,
        control: string,
    ) => {
    // const control = tagControls[tag];
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

export const $paragraphControl = makeTagControlRule("Paragraph", paragraphItemControls.Paragraph);
export const $itemControl = makeTagControlRule("Item", paragraphItemControls.Item);
export const $subitem1Control = makeTagControlRule("Subitem1", paragraphItemControls.Subitem1);
export const $subitem2Control = makeTagControlRule("Subitem2", paragraphItemControls.Subitem2);
export const $subitem3Control = makeTagControlRule("Subitem3", paragraphItemControls.Subitem3);
export const $subitem4Control = makeTagControlRule("Subitem4", paragraphItemControls.Subitem4);
export const $subitem5Control = makeTagControlRule("Subitem5", paragraphItemControls.Subitem5);
export const $subitem6Control = makeTagControlRule("Subitem6", paragraphItemControls.Subitem6);
export const $subitem7Control = makeTagControlRule("Subitem7", paragraphItemControls.Subitem7);
export const $subitem8Control = makeTagControlRule("Subitem8", paragraphItemControls.Subitem8);
export const $subitem9Control = makeTagControlRule("Subitem9", paragraphItemControls.Subitem9);
export const $subitem10Control = makeTagControlRule("Subitem10", paragraphItemControls.Subitem10);

export const $anonymParagraphControl = makeTagControlRule("Paragraph", anonymParagraphItemControls.Paragraph);
export const $anonymItemControl = makeTagControlRule("Item", anonymParagraphItemControls.Item);
export const $anonymSubitem1Control = makeTagControlRule("Subitem1", anonymParagraphItemControls.Subitem1);
export const $anonymSubitem2Control = makeTagControlRule("Subitem2", anonymParagraphItemControls.Subitem2);
export const $anonymSubitem3Control = makeTagControlRule("Subitem3", anonymParagraphItemControls.Subitem3);
export const $anonymSubitem4Control = makeTagControlRule("Subitem4", anonymParagraphItemControls.Subitem4);
export const $anonymSubitem5Control = makeTagControlRule("Subitem5", anonymParagraphItemControls.Subitem5);
export const $anonymSubitem6Control = makeTagControlRule("Subitem6", anonymParagraphItemControls.Subitem6);
export const $anonymSubitem7Control = makeTagControlRule("Subitem7", anonymParagraphItemControls.Subitem7);
export const $anonymSubitem8Control = makeTagControlRule("Subitem8", anonymParagraphItemControls.Subitem8);
export const $anonymSubitem9Control = makeTagControlRule("Subitem9", anonymParagraphItemControls.Subitem9);
export const $anonymSubitem10Control = makeTagControlRule("Subitem10", anonymParagraphItemControls.Subitem10);

export const $appdxControl = makeTagControlRule("Appdx", appdxItemControls.Appdx);
export const $appdxTableControl = makeTagControlRule("AppdxTable", appdxItemControls.AppdxTable);
export const $appdxStyleControl = makeTagControlRule("AppdxStyle", appdxItemControls.AppdxStyle);
export const $appdxFormatControl = makeTagControlRule("AppdxFormat", appdxItemControls.AppdxFormat);
export const $appdxFigControl = makeTagControlRule("AppdxFig", appdxItemControls.AppdxFig);
export const $appdxNoteControl = makeTagControlRule("AppdxNote", appdxItemControls.AppdxNote);

export const $supplProvisionAppdxControl = makeTagControlRule("SupplProvisionAppdx", supplProvisionAppdxItemControls.SupplProvisionAppdx);
export const $supplProvisionAppdxTableControl = makeTagControlRule("SupplProvisionAppdxTable", supplProvisionAppdxItemControls.SupplProvisionAppdxTable);
export const $supplProvisionAppdxStyleControl = makeTagControlRule("SupplProvisionAppdxStyle", supplProvisionAppdxItemControls.SupplProvisionAppdxStyle);


