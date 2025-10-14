const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (err) { return cb(err); }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `dbimport-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only JSON for now for simplicity
  const allowed = /json$/i.test(path.extname(file.originalname).slice(1)) || file.mimetype === 'application/json';
  if (allowed) return cb(null, true);
  cb(new Error('Format file tidak didukung. Gunakan file .json hasil export.'));
};

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 }, fileFilter });

exports.uploadDbFile = (req, res, next) => {
  const single = upload.single('dataFile');
  single(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};