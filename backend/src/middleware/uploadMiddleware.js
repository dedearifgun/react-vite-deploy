const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
      return cb(err);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow only images
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB per image
  fileFilter: fileFilter
});

// Upload product image
exports.uploadProductImage = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Upload multiple product images (main, additional, color-specific)
exports.uploadProductImages = (req, res, next) => {
  const uploadAny = upload.any();

  uploadAny(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message.includes('File too large')
          ? 'Ukuran gambar maksimal 1MB per file'
          : err.message
      });
    }

    // Normalize files into body fields
    if (Array.isArray(req.files)) {
      const imagesByColor = {};
      const additionalImages = [];
      const mainImages = [];

      for (const file of req.files) {
        const url = `/uploads/${file.filename}`;
        if (file.fieldname === 'image') {
          mainImages.push(url);
        } else if (file.fieldname === 'additionalImages') {
          additionalImages.push(url);
        } else {
          // Dynamic color field: colorImages_<color>
          const match = file.fieldname.match(/^colorImages_(.+)$/);
          if (match) {
            const color = match[1];
            imagesByColor[color] = url;
          }
        }
      }

      if (mainImages.length) {
        req.body.imageUrl = mainImages[0];
        if (mainImages.length > 1) {
          additionalImages.push(...mainImages.slice(1));
        }
      }
      if (additionalImages.length) {
        req.body.additionalImages = additionalImages;
      }
      if (Object.keys(imagesByColor).length) {
        req.body.imagesByColor = imagesByColor;
      }
    }

    next();
  });
};

// Upload category image
exports.uploadCategoryImage = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};