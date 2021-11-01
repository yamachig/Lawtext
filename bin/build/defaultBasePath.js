import url from "url";

export const defaultBasePath = url.fileURLToPath(new URL("../../", import.meta.url));
