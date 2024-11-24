import multer from "multer"
import path from "path";


 const storage = multer.diskStorage({
  destination: "./fayllar/",
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileDownload = multer({ storage }).single("file");

export function fileDownloadMiddleware
(req, res, next) {
  fileDownload(req, res, (err) => {
    if (err) {
      console.error("fayl yuklash xatoligi => ", err)
      res.status(500).send("faylga yuklashda xatolik boldi");
    }
    next();
  });
  console.log("fayl ishladi");
}
