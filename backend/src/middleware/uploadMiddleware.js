const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per image
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
          ? 'Ukuran gambar maksimal 20MB per file'
          : err.message
      });
    }

    // Convert to WebP + optional resize, then normalize files into body fields
    (async () => {
      if (!Array.isArray(req.files) || !req.files.length) {
        return next();
      }

      const imagesByColor = {};
      const additionalImages = [];
      const mainImages = [];

      const SIZES = [
        { key: 'thumb', width: 320 },
        { key: 'medium', width: 800 },
        { key: 'large', width: 1600 },
      ];

      for (const file of req.files) {
        const inputPath = file.path;
        let largeUrl = '';
        try {
          const parsed = path.parse(inputPath);
          // Hasilkan 3 ukuran file webp
          for (const s of SIZES) {
            const webpName = `${parsed.name}-${s.key}.webp`;
            const outputPath = path.join(parsed.dir, webpName);
            await sharp(inputPath)
              .rotate()
              .resize({ width: s.width, withoutEnlargement: true })
              .webp({ quality: 82 })
              .toFile(outputPath);
            if (s.key === 'large') {
              largeUrl = `/uploads/${webpName}`;
              file.filename = webpName;
              file.path = outputPath;
            }
          }
          try { fs.unlinkSync(inputPath); } catch {}
        } catch (convErr) {
          console.error('Konversi multi-ukuran WebP gagal, gunakan file asli:', convErr.message);
        }

        const url = largeUrl || `/uploads/${file.filename}`;
        if (file.fieldname === 'image') {
          mainImages.push(url);
        } else if (file.fieldname === 'additionalImages') {
          additionalImages.push(url);
        } else {
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

      next();
    })();
  });
};

// Upload category image
exports.uploadCategoryImage = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    try {
      if (req.file && req.file.path) {
        const SIZES = [
          { key: 'thumb', width: 320 },
          { key: 'medium', width: 800 },
          { key: 'large', width: 1600 },
        ];
        const parsed = path.parse(req.file.path);
        let largeUrl = '';
        for (const s of SIZES) {
          const webpName = `${parsed.name}-${s.key}.webp`;
          const outputPath = path.join(parsed.dir, webpName);
          await sharp(req.file.path)
            .rotate()
            .resize({ width: s.width, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(outputPath);
          if (s.key === 'large') {
            req.file.filename = webpName;
            req.file.path = outputPath;
            largeUrl = `/uploads/${webpName}`;
          }
        }
        try { fs.unlinkSync(req.file.path); } catch {}
        req.body.imageUrl = largeUrl || `/uploads/${req.file.filename}`;
      }
    } catch (convErr) {
      console.error('Konversi WebP multi-ukuran kategori gagal:', convErr.message);
    }
    next();
  });
};