import type webpack from "webpack";

export default class WatchMessagePlugin {
    public apply(compiler: webpack.Compiler): void {
        compiler.hooks.beforeRun.tap("WatchMessagePlugin", () => {
            console.log("\r\n\x1b[36m" + "Begin compile at " + new Date() + " \x1b[39m");
        });
        compiler.hooks.watchRun.tap("WatchMessagePlugin", () => {
            console.log("\r\n\x1b[36m" + "Begin compile at " + new Date() + " \x1b[39m");
        });
        compiler.hooks.done.tap("WatchMessagePlugin", () => {
            setTimeout(() => {
                console.log("\r\n\x1b[36m" + "Done compile at " + new Date() + " \x1b[39m");
            }, 30);
        });
    }
}
