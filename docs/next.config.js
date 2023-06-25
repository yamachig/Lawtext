/**
 * @type {import('next').default}
 **/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextra = require("nextra");


const withNextra = nextra({
    theme: "nextra-theme-docs",
    themeConfig: "./theme.config.tsx",
});

const config = {
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};
module.exports = withNextra(config);

