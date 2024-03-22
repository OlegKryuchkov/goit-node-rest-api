import multer from "multer";

import { getDir } from "../helpers/getDir.js";

const tempDir = getDir("../tmp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: multerConfig,
});
