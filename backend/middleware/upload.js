const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const createUpload = (folder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, `uploads/${folder}`),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().slice(1);
      if (ALLOWED_TYPES.test(ext)) return cb(null, true);
      cb(new Error('Invalid file type. Allowed: images, PDF, Word, Excel, PowerPoint, TXT'));
    }
  });
};

module.exports = { createUpload };
