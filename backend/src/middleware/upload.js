
import fs from "node:fs";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const uploadDirectory = fileURLToPath(
  new URL("../../uploads/projects/", import.meta.url)
);

// Create upload directory automatically
fs.mkdirSync(uploadDirectory, { recursive: true });

// Allowed image formats
const mimeExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// Configure image storage
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = mimeExtensions[file.mimetype];

    callback(null, `${randomUUID()}${extension}`);
  },
});

// Validate uploaded image
function imageFilter(_req, file, callback) {
  if (!mimeExtensions[file.mimetype]) {
    return callback(
      new Error("Only JPG, PNG and WEBP images are allowed.")
    );
  }

  callback(null, true);
}

// Multer configuration
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export default upload;
