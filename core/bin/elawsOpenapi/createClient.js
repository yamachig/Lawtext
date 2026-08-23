import { createClient } from "@hey-api/openapi-ts";
import fs from "node:fs";
import path from "path";

const createElawsOpenapiClient = async () => {
    const url = "https://laws.e-gov.go.jp/api/2/swagger-ui/lawapi-v2.yaml";
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }
    const origYaml = await response.text();
    const yaml = `# Source: ${url}

${origYaml}`;
    const yamlPath = path.join(import.meta.dirname, "lawapi-v2.yaml");
    fs.writeFileSync(yamlPath, yaml, "utf-8");
    return createClient({
        input: yamlPath,
        output: {
            path: path.join(import.meta.dirname, "../../src/elawsOpenapi"),
            header: () => [`// This file is auto-generated from ${url}`],
        },
        plugins: ["@hey-api/client-fetch"],
    });
};

if (import.meta.main) {
    await createElawsOpenapiClient().catch(console.error);
}


