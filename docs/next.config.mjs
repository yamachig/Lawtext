import nextra from "nextra";

import baseConfig from "./base.next.config.mjs";

const withNextra = nextra({
    search: false,
});

// @type {import('next').NextConfig}
const config = {
    ...baseConfig,
    output: "export",
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default withNextra(config);

