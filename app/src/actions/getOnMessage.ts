import type { BaseLawtextAppPageState, OrigSetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "lawtext/dist/src/util";

export const getOnMessage = (options: {key: string, origSetState: OrigSetLawtextAppPageState}) => {

    const { key, origSetState } = options;

    const onMessage = (message: string | null) => {
        origSetState(s => (
            (message !== null)
                ? {
                    ...s,
                    viewerMessages: {
                        ...s.viewerMessages,
                        [key]: message,
                    },
                }
                : {
                    ...s,
                    viewerMessages: util.omit(s.viewerMessages, key),
                }
        ));
        if (message !== null) console.log({ key, message });
    };

    const setStateAndMessage = (state: React.SetStateAction<BaseLawtextAppPageState>, message: string | null) => {
        origSetState(s => {
            const sWithMessage = (
                (message !== null)
                    ? {
                        ...s,
                        viewerMessages: {
                            ...s.viewerMessages,
                            [key]: message,
                        },
                    }
                    : {
                        ...s,
                        viewerMessages: util.omit(s.viewerMessages, key),
                    }
            );
            if (message !== null) console.log({ key, message });

            if (typeof state === "function") {
                return state(sWithMessage);
            } else {
                return {
                    ...sWithMessage,
                    ...state,
                };
            }
        });
    };

    return { onMessage, setStateAndMessage };
};

export default getOnMessage;
