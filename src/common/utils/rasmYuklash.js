import multer from "multer"
import path from "path";


 const storage = multer.diskStorage({
  destination: "./profilePic/",
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const PicDawnload = multer({ storage }).single("rasm");

export function profilePicMiddleware
(req, res, next) {
  PicDawnload(req, res, (err) => {
    if (err) {
      console.error("fayl yuklash xatoligi => ", err)
      res.status(500).send("faylga yuklashda xatolik boldi");
    }
    next();
  });
  console.log("fayl ishladi");
}
