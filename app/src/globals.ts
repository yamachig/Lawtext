import * as actions from "./actions";
import * as lawdata from "./actions/lawdata";
import { showLawXML } from "./actions/temp_law";
import { LawCriteria, LawQuery } from "@coresrc/data/query";


export default {

    app: {
        actions,
        lawdata,
    },

    showLawXML,

    laws: (criteria: LawCriteria = null): LawQuery =>
        LawQuery.fromFetchInfo(lawdata.storedLoader, criteria),

    lawsViaAPI: (criteria: LawCriteria = null): LawQuery => {
        console.warn("クエリの実行に e-Gov 法令API を使用します。時間がかかる場合があります。");
        return LawQuery.fromFetchInfo(lawdata.elawsLoader, criteria);
    },

};
