/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "@coresrc/std_law";
import { __Text, setItemNum } from "@coresrc/util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $__ } from "../lexical";
import { $article } from "./article";
import { $no_name_paragraph_item, $paragraph_item } from "./paragraphItem";
import { $suppl_provision_appdx } from "./supplProvisionAppdx";
import { $suppl_provision_appdx_style } from "./supplProvisionAppdxStyle";
import { $suppl_provision_appdx_table } from "./supplProvisionAppdxTable";

export const $suppl_provision_label = factory
    .withName("suppl_provision_label")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .asSlice(r => r
                    .sequence(c => c
                        .and(r => r
                            .regExp(/^[附付]/),
                        )
                        .and(r => r
                            .ref(() => $_),
                        )
                        .and(r => r
                            .seqEqual("則"),
                        ),
                    ),
                )
            , "label")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $ROUND_PARENTHESES_INLINE)
                            , "target"),
                        )
                    , (({ target }) => {
                        return target.content;
                    }),
                    ),
                )
            , "amend_law_num")
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $_),
                        )
                        .and(r => r
                            .seqEqual("抄"),
                        ),
                    ),
                )
            , "extract")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            ),
        )
    , (({ label, amend_law_num, extract }) => {
        return {
            label: label,
            amend_law_num: amend_law_num,
            extract: extract,
        };
    }),
    )
;

export const $suppl_provision = factory
    .withName("suppl_provision")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $suppl_provision_label)
            , "suppl_provision_label")
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .oneOrMore(r => r
                            .ref(() => $article),
                        ),
                    )
                    .or(r => r
                        .oneOrMore(r => r
                            .ref(() => $paragraph_item),
                        ),
                    )
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $no_name_paragraph_item)
                                , "first")
                                .and(r => r
                                    .zeroOrMore(r => r
                                        .ref(() => $paragraph_item),
                                    )
                                , "rest"),
                            )
                        , (({ first, rest }) => {
                            return [first].concat(rest);
                        }),
                        ),
                    ),
                )
            , "children")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .ref(() => $suppl_provision_appdx_table),
                        )
                        .or(r => r
                            .ref(() => $suppl_provision_appdx_style),
                        )
                        .or(r => r
                            .ref(() => $suppl_provision_appdx),
                        ),
                    ),
                )
            , "suppl_provision_appdx_items"),
        )
    , (({ suppl_provision_label, children, suppl_provision_appdx_items }) => {
        const suppl_provision = newStdEL("SupplProvision");
        if (suppl_provision_label.amend_law_num) {
            suppl_provision.attr["AmendLawNum"] = suppl_provision_label.amend_law_num;
        }
        if (suppl_provision_label.extract !== null) {
            suppl_provision.attr["Extract"] = "true";
        }
        suppl_provision.append(newStdEL("SupplProvisionLabel", {}, [new __Text(suppl_provision_label.label)]));

        if (children) {
            setItemNum(children);
        }
        suppl_provision.extend(children);
        suppl_provision.extend(suppl_provision_appdx_items);
        return suppl_provision;
    }),
    )
;


export const rules = {
    suppl_provision_label: $suppl_provision_label,
    suppl_provision: $suppl_provision,
};
