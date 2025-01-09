import { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));

export default (req: VercelRequest, res: VercelResponse): void => {
  res.json({ version: packageJson.version });
};
