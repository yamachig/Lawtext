import * as actions from "./actions";
import * as lawdata from "./actions/lawdata";
import { getLawList, LawInfo } from "@coresrc/data/lawlist";
import { LawCriteria, LawCriteriaArgs, LawQuery } from "@coresrc/data/query";

const getLawListAuto = (): ReturnType<typeof getLawList> =>
    getLawList(lawdata.getDataPath(), lawdata.textFetcher);
const getLawListOnly = async (): Promise<LawInfo[]> => {
    const [lawList] = await getLawListAuto();
    return lawList;
};
const getLawListByLawnum = async (): Promise<{[index: string]: LawInfo}> => {
    const [, lawListByLawnum] = await getLawListAuto();
    return lawListByLawnum;
};
export default {
    app: {
        actions,
        lawdata,
    },
    getLawList: getLawListOnly,
    getLawListByLawnum: getLawListByLawnum,
    query: (criteriaOrArgs: LawCriteria | LawCriteriaArgs): LawQuery =>
        LawQuery.fromPromiseLawInfos(
            getLawListOnly(),
            criteriaOrArgs,
        ),
};
