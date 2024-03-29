// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();
const fetch:
    (typeof import("node-fetch/@types/index"))["default"]
= (
    (...args) =>
        import("node-fetch")
            .then(
                ({ default: fetch }) =>
                    (fetch)(...args),
            )
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch;

import { after, before } from "mocha";

const notify = async (title: string, message: string) => {

    if (!process.env.NOTIFICATION_ENDPOINT) {
        return;
    }

    await fetch(
        process.env.NOTIFICATION_ENDPOINT,
        {
            method: "POST",
            body: JSON.stringify({ value1: title, value2: message }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

};


before(async () => {
    if (process.env.NOTIFICATION_ENDPOINT) {
        console.log("It will notify your ifttt when it finished.");
    }
});

after(async () => {
    await notify("test finished!", `"${process.argv.join(" ")}" has just been finished.`);
});
