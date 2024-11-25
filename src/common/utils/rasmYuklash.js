import multer from "multer";
import path from "path";
import fs from "fs";
// Multer saqlash konfiguratsiyasi
const uploadDir = "../uploads/userphotos";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // direktiv yo'q bo'lsa, yaratib beradi
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Fayl filtrini aniqlash
const fileFilter = (req, file, callback) => {
  const allowedFileTypes = [".jpg", ".jpeg", ".png"]; // Ruxsat berilgan fayl turlari
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(extname)) {
    callback(null, true);
  } else {
    callback(new Error("Faqat .jpg, .jpeg, va .png fayllar qabul qilinadi!"));
  }
};

// Multer sozlamalari
const picDownload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // Maksimal fayl hajmi: 3MB
  },
  fileFilter,
}).single("photo");

// Middleware funksiyasi
export function profilePicMiddleware(req, res, next) {
  picDownload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send("Fayl hajmi 2MB dan oshmasligi kerak!");
        }
      } else if (err) {
        console.error("Fayl yuklashda hatolik: ", err.message);
        return res.status(400).send(err.message);
      }
    }
    next();
  });
}
