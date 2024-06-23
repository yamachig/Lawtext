/**
 * @type {import('next').default}
 **/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextra = require("nextra");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require("./base.next.config");


const withNextra = nextra({
    theme: "nextra-theme-docs",
    themeConfig: "./theme.config.tsx",
});

const config = {
    ...baseConfig,
    output: "export",
    experimental: {
        webpackBuildWorker: true,
        esmExternals: false,
        serverSourceMaps: false,
        ...(
            process.env.GITHUB_ACTION
                ? {}
                : {
                    workerThreads: false,
                    cpus: 1,
                }
        ),
    },

    productionBrowserSourceMaps: false,

    images: {
        unoptimized: true,
    },

    trailingSlash: true,

    webpack: (
        config,
        { dev },
    ) => {
        if (config.cache && !dev) {
            config.cache = Object.freeze({
                type: "memory",
            });
            config.cache.maxMemoryGenerations = 0;
        }
        return config;
    },
};
module.exports = withNextra(config);

