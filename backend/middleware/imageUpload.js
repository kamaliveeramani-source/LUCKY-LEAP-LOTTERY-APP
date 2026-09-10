const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return callback(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
    callback(null, true);
  },
});

function imageUpload(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.message });
    next();
  });
}

module.exports = imageUpload;
