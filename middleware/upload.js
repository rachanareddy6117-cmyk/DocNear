const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Creates a disk storage engine that saves into backend/uploads/<folder>
function makeStorage(folder) {
  const dir = path.join(__dirname, "..", "uploads", folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

const allowedTypes = /jpeg|jpg|png|pdf/;
function fileFilter(req, file, cb) {
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only .jpeg, .jpg, .png and .pdf files are allowed"));
}

const maxSize = (parseInt(process.env.MAX_UPLOAD_MB) || 10) * 1024 * 1024;

const uploadReport = multer({ storage: makeStorage("reports"), fileFilter, limits: { fileSize: maxSize } });
const uploadPrescription = multer({ storage: makeStorage("prescriptions"), fileFilter, limits: { fileSize: maxSize } });

module.exports = { uploadReport, uploadPrescription };
