import os from "os";
import path from "path";
import fs from "fs";

export const ensureTempTestDir = () => {
    const tempDir = path.join(os.tmpdir(), "lawtext_core_test");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
};

export default ensureTempTestDir;
