import path from "path";
import { fileURLToPath } from "url";

export const getDir = (pathToDir) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, pathToDir);
};
