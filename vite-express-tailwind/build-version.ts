import { execSync } from "child_process";
import fs from "fs";

const commitHash = execSync("git rev-parse HEAD").toString().trim();
const content = `// This file is auto-generated during build
export const commitHash = '${commitHash.slice(0, 8)}';`;

fs.writeFileSync("commitHash.ts", content);
