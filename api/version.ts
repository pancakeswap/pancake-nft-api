import { VercelRequest, VercelResponse } from "@vercel/node";
import packageJson from "../package.json" assert { type: "json" };

export default (req: VercelRequest, res: VercelResponse): void => {
  res.json({ version: packageJson.version });
};
