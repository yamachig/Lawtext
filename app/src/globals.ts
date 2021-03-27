import * as actions from "./actions";
import * as lawdata from "./actions/lawdata";
import * as query from "./actions/query";
import { getLawList, LawInfo } from "@coresrc/data/lawlist";
import { LawCriteria, LawQuery } from "@coresrc/data/query";

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
        query,
    },
    getLawList: getLawListOnly,
    getLawListByLawnum: getLawListByLawnum,
    openLawInNewTab: query.openLawInNewTab,
    query: (criteria: LawCriteria): LawQuery =>
        LawQuery.fromFetchInfo(
            lawdata.getDataPath(),
            lawdata.textFetcher,
            criteria,
        ),
};
