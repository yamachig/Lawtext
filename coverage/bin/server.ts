import server from "../src/server";

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", (listener) => {
        throw listener;
    });
    server();
}
