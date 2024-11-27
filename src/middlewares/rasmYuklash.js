import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Multer saqlash konfiguratsiyasi
const uploadDir = "./uploads/userphotos"; // Katalogni hozirgi ishchi papkada joylashtiramiz

// Agar 'uploads/userphotos' papkasi mavjud bo'lmasa, uni yaratish
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Agar yo'l mavjud bo'lmasa, yaratib beradi
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    callback(null, uploadDir); // Faylni yuklash uchun yo'nalish
  },
  filename: function (req, file, callback) {
    const extname = path.extname(file.originalname); // Fayl kengaytmasini olish
    callback(null, uuidv4() + extname); // UUID bilan noyob nom yaratish
  },
});

// Fayl filtrini aniqlash
const fileFilter = (req, file, callback) => {
  const allowedFileTypes = [".jpg", ".jpeg", ".png"]; // Ruxsat berilgan fayl turlari
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(extname)) {
    callback(null, true); // Ruxsat berilgan fayl turlari
  } else {
    callback(new Error("Faqat .jpg, .jpeg, va .png fayllar qabul qilinadi!"), false);
  }
};

// Multer sozlamalari
const picDownload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Maksimal fayl hajmi: 3MB
  },
  fileFilter,
}).single("picture",1); // "picture" - frontendda fayl inputining name atributi

// Middleware funksiyasi
export function profilePicMiddleware(req, res, next) {
  picDownload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: "Fayl yuklashda hatolik",
        error: err.message,
      });
    }

    // Agar fayl muvaffaqiyatli yuklansa, keyingi middleware'ga o'tish
    console.log("Fayl muvaffaqiyatli yuklandi:", req.file);
    next(); // Keyingi middlewarega o'tish
  });
}
