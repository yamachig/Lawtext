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
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};
module.exports = withNextra(config);

