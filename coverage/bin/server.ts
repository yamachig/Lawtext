import server from "../src/server/index.ts";

if (import.meta.main) {
    process.on("unhandledRejection", (listener) => {
        throw listener;
    });
    server();
}
