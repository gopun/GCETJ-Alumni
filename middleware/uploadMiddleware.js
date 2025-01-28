const multer = require("multer");
const path = require("path");
const fs = require("fs");
const storage = multer.memoryStorage();

// Create uploads directory if it doesn't exist
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// Configure Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // Destination folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueSuffix); // Unique file name
//   },
// });

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Unsupported file type. Allowed: jpeg, jpg, png, gif, pdf")); // Reject file
  }
};

// Middleware for file uploads
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter,
});

module.exports = {
  uploadSingle: (fieldName) => uploadMiddleware.single(fieldName),
  uploadMultiArray: (fieldName, maxCount) =>
    uploadMiddleware.array(fieldName, maxCount),
  uploadMultiFields: (fields) => uploadMiddleware.fields(fields),
};
