require('dotenv').config();

require('source-map-support').install();
(global as any).fetch = require("node-fetch");

import { after, before } from "mocha";
import { setLawdataPath } from "../../core/test/prepare_test";
import path from "path";

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
                "Content-Type": "application/json"
            },
        },
    );

};


before(async () => {
    setLawdataPath(path.join(__dirname, "../../core/test/lawdata"));
    if (process.env.NOTIFICATION_ENDPOINT) {
        console.log("It will notify your ifttt when it finished.");
    }
});

after(async () => {
    await notify("test finished!", `"${process.argv.join(" ")}" has just been finished.`);
});
