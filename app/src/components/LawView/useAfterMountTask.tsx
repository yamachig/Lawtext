import React, { } from "react";
import { omit } from "lawtext/dist/src/util";
import type { OrigSetLawtextAppPageState } from "../LawtextAppPageState";


export const useAfterMountTasks = (origSetState: OrigSetLawtextAppPageState) => {
    const status = React.useMemo(() => ({
        tasks: [] as (() => unknown)[],
        doneCount: 0,
        started: null as Date | null,
    }), []);

    const addAfterMountTask = React.useCallback((func: () => unknown) => {
        status.tasks.push(func);
    }, [status]);

    const checkTaskTimer = React.useRef<NodeJS.Timeout>();

    const checkTaskInner = React.useCallback(() => {

        const tasks = status.tasks.splice(0, 512);

        if (tasks.length === 0) {
            checkTaskTimer.current = setTimeout(checkTaskInner, 3000);
            return;
        }

        if (!status.started) {
            console.log("useAfterMountTasks started");
            status.started = new Date();
            status.doneCount = 0;

            origSetState(s => ({
                ...s,
                viewerMessages: {
                    ...s.viewerMessages,
                    afterMountTasks: "追加のレンダリングを行っています (0%)...",
                },
            }));
        }

        for (const task of tasks) {
            task();
            status.doneCount++;
        }

        if (status.tasks.length > 0) {
            origSetState(s => ({
                ...s,
                viewerMessages: {
                    ...s.viewerMessages,
                    afterMountTasks: `追加のレンダリングを行っています (${Math.ceil(status.doneCount / (status.doneCount + status.tasks.length) * 100)}%)...`,
                },
            }));
        } else {
            origSetState(s => ({
                ...s,
                viewerMessages: omit(s.viewerMessages, "afterMountTasks"),
            }));
        }

        if (status.tasks.length === 0 && status.started) {
            console.log(`useAfterMountTasks finished: ${status.doneCount} items in ${new Date().getTime() - status.started.getTime()} ms`);
            status.started = null;
        }

        checkTaskTimer.current = setTimeout(checkTaskInner, 1);

    }, [origSetState, status]);

    React.useEffect(() => {
        checkTaskTimer.current = setTimeout(checkTaskInner, 300);
        return () => {
            if (checkTaskTimer.current) clearTimeout(checkTaskTimer.current);
        };
    }, [checkTaskInner]);

    return {
        addAfterMountTask,
    };
};

export default useAfterMountTasks;
