import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
];

// Max file size (25MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads/admin-task/";

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error("File type not allowed"), false);
  }

  // Additional security checks
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    ![".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif"].includes(ext)
  ) {
    return cb(new Error("File extension not allowed"), false);
  }

  cb(null, true);
};

// Create multer upload instance
const fileDownload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Allow only 1 file per request
  },
  fileFilter: fileFilter,
}).single("file");

// Enhanced middleware with error handling
export function fileDownloadMiddleware(req, res, next) {
  fileDownload(req, res, (err) => {
    if (err) {
      console.error("File upload error:", {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        user: req.user?.id,
        originalname: req.file?.originalname,
      });

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message: `File size should not exceed ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB`,
            code: "FILE_TOO_LARGE",
          });
        }
        return res.status(400).json({
          error: "File upload error",
          message: err.message,
          code: "UPLOAD_ERROR",
        });
      }

      return res.status(400).json({
        error: "Invalid file",
        message: err.message,
        code: "INVALID_FILE",
      });
    }

    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please select a file to upload",
        code: "NO_FILE",
      });
    }

    // Log successful upload
    console.log("File uploaded successfully:", {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      timestamp: new Date().toISOString(),
      user: req.user?.id,
    });

    next();
  });
}
