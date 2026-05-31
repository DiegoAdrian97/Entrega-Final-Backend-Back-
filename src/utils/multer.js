import multer from "multer";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de archivo no permitido. Solo JPG, PNG, WEBP, GIF."),
      false,
    );
  }
};

const profPicsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/public/js/profilePics"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const prodPicsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/public/js/productPics"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/public/js/documentsPics"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

export const Docs = multer({
  storage: docsStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});
export const ProfPics = multer({
  storage: profPicsStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});
export const prodPics = multer({
  storage: prodPicsStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});
