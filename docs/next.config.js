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
    experimental: {
        esmExternals: false,
        ...(
            process.env.GITHUB_ACTION
                ? {}
                : {
                    workerThreads: false,
                    cpus: 1,
                }
        ),
    },
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};
module.exports = withNextra(config);

