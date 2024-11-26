import jwt from "jsonwebtoken";
import getDotEnv from "../../../common/config/dotenv.config.js";
// import searchUsers from "../../../common/utils/search.js";
// import fileSystem from "fs";
import { Op } from "sequelize";
import userModel from "./user.model.js";

import {
  getUserValidator,
  loginUserValidator,
  registerUserValidator,
  updateUserValidator,
} from "../../validator/userValidator.js";
import tasksModel from "../task/task.model.js";
import eduModel from "./userEdu.model.js";
// import { profilePicMiddleware } from "../../../middlewares/rasmYuklash.js";

// rasm saqlanadigan direktoriya ✅
const uploadDir = "../uploads/userphotos";

// register user service toliq emas 🔰
export async function registerUser(req, res) {
  try {
<<<<<<< HEAD
    const {
      name,
      lastname,
      email,
      password,
      role,
      tugilgan_sana,
      bolim,
      lavozim,
      talim_muassasasi,
      malumoti,
      talim_davri,
      mutahasisligi,
      phone,
    } = req.body;

    profileImage = req.file;

    // Valdiatsiya qilish
    const { error } = registerUserValidator.validate(newUser);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    if (
      !name ||
      !lastname ||
      !email ||
      !password ||
      !profileImage ||
      !role ||
      !tugilgan_sana ||
      !bolim ||
      !lavozim ||
      !talim_muassasasi ||
      !malumoti ||
      !talim_davri ||
      !mutahasisligi ||
      !phone 
    ) {
      return res.status(400).json({ message: "Hamma maydonlarni to'ldiring" });
    }

    // Emailni tekshirish
    const existingLogin = await findUserByEmail(newUser.email);
    if (existingLogin) {
      return res.status(400).send("User email allaqachon ro'yxatdan o'tgan.");
    }

    // Agar rasm yuklangan bo'lsa, yo'lni o'rnating
    if (req.file) {
      newUser.photo = req.file.destination + req.file.filename;
    }

    // Parolni xeshlash
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    // Foydalanuvchini bazaga saqlash
    const result = await userModel.create({
      ...newUser,
      password: hashedPassword,
    });

    res.status(200).send(result);
  } catch (err) {
    console.log("xatolik:", err);
    res
      .status(500)
      .send(
        "Foydalanuvchini ro'yxatdan o'tkazishda xatolik yuz berdi: " +
          err.message
=======
    const { fullname, email, birth_date, department, position, phone, edu } = req.body;

    let picture = req.file ? req.file.filename : "default-ava.jpg";
    let filePath = req.file ? req.file.path : null;

    let eduParse = JSON.parse(edu)

    // Foydalanuvchi ma'lumotlarini yaratish
    const user = await userModel.create({
      fullname,
      email,
      birth_date,
      picture,
      file: filePath,
      department,
      position,
      phone,
    });

    // Edu ma'lumotlarini tekshirish
    if (edu && Array.isArray(eduParse)) {
      await Promise.all(
        eduParse.map(async (eduItem) => {
          await eduModel.create({
            edu_name: eduItem.edu_name,
            study_year: eduItem.study_year,
            degree: eduItem.degree,
            specialty: eduItem.specialty,
            user_id: user.user_id, // Foydalanuvchi IDsi
          });
        })
>>>>>>> b76790642a863fe0831b7395bb5aa5b7d5ba6b1c
      );
    }

    res.status(201).json({
      message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
      user, // Yangi foydalanuvchi haqida ma'lumot
    });
  } catch (err) {
    res.status(500).json({
      message: "Foydalanuvchi ro'yxatdan o'tkazishda xatolik yuz berdi",
      error: err.message, // Aniqroq xatolik ma'lumoti
    });
  }
}

<<<<<<< HEAD
// export async function registerUser(req, res) {
try {
  const newUser = req.body;
  const { error } = registerUserValidator.validate(newUser);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const existingLogin = await findUserByEmail(newUser.email);
  if (existingLogin) {
    return res.status(400).send("User email allaqachon ro'yxatdan o'tgan.");
  }

  if (req.file) {
    newUser.photo = req.file.destination + req.file.filename;
  }
  let existUsers = readFromFile("photo.json");

  if (!existUsers) {
    existUsers = [];
    writeToFile("photo.json", [newUser]);
    console.log("foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi");
  } else {
    existUsers.push(newUser);
    writeToFile("photo.json", existUsers);
  }

  const hashedPassword = await bcrypt.hash(newUser.password, 10);
  const result = await userModel.create({
    ...newUser,
    password: hashedPassword,
  });

  res.status(200).send(result);
} catch (err) {
  console.log("xatoliiiik", err);
  res
    .status(500)
    .send(
      "Foydalanuvchini ro'yxatdan o'tkazishda xatolik yuz berdi: " + err.message
    );
}
// }

// const registerUser = async (req, res) => {
//     try {
//         const { name, email } = req.body;
//         const profileImage = req.file; // Multer orqali kelgan fayl

//         if (!name || !email || !profileImage) {
//             return res.status(400).json({ message: 'Hamma maydonlarni to\'ldiring' });
//         }

//         // Faylning URL manzilini olish
//         const profileImageUrl = `/uploads/${profileImage.filename}`;

//         // Ma'lumotlar bazasiga foydalanuvchini qo'shish
//         const newUser = await User.create({
//             name,
//             email,
//             profile_image_url: profileImageUrl,
//         });

//         res.status(201).json({ message: 'Foydalanuvchi muvaffaqiyatli qo\'shildi', user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Xatolik yuz berdi' });
//     }
// };

export function writeToFile(address, data) {
  fileSystem.writeFileSync(address, JSON.stringify(data));
}

export function readFromFile(address) {
  try {
    const existFile = fileSystem.existsSync(address);
    if (!existFile) return null; // Fayl topilmasa null qaytaramiz

    const stringData = fileSystem.readFileSync(address);
    const data = JSON.parse(stringData);
    return data;
  } catch (error) {
    console.error("Fayldan o'qishda xatolik:", error);
    return null; // Xatolik bo'lsa null qaytaramiz
  }
}

function findUserByEmail(email) {
  return userModel.findOne({
    where: { email: email },
  });
}
=======
>>>>>>> b76790642a863fe0831b7395bb5aa5b7d5ba6b1c

// hali to'liq emas 🔰
export async function loginUser(req, res) {
  try {
    const { email, phone } = req.body;
    const { error } = loginUserValidator.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      return res.status(404).send("Foydalanuvchi topilmadi.");
    }

    if (existingUser.email === email && existingUser.phone === phone) {
      res.status(200).send({
        message: "siz tizimga muvaffaqiyatli kirdiz",
        token: generateToken({ email: existingUser.email, role:"hodim" }),
      });
      
    } else {
      res.send("parol notog'ri");
    }
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    res.status(500).send("Login jarayonida xatolik yuz berdi: " + err.message);
  }
}

function generateToken(data) {
  return jwt.sign(data, getDotEnv("JWT_SECRET"), { expiresIn: "1d" });
}

// sorting users ✅
export async function searchUserController(req, res) {
  try {
    const { searchTerm, fullname, bolim, lavozim, malumoti, email, createdAt } =
      req.query;

    let where = {};

    if (searchTerm) {
      where[Op.or] = [
        { fullname: { [Op.iLike]: `%${searchTerm}%` } },
        { bolim: { [Op.iLike]: `%${searchTerm}%` } },
        { lavozim: { [Op.iLike]: `%${searchTerm}%` } },
        { malumoti: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { createdAt: { [Op.gte]: `%${searchTerm}%` } },
      ];
    }

    if (fullname) {
      where.fullname = { [Op.iLike]: `%${fullname}%` };
    }

    if (bolim) {
      where.bolim = { [Op.iLike]: `%${bolim}%` };
    }

    if (lavozim) {
      where.lavozim = { [Op.iLike]: `%${lavozim}%` };
    }

    if (malumoti) {
      where.malumoti = { [Op.iLike]: `%${malumoti}%` };
    }

    if (email) {
      where.email = { [Op.iLike]: `%${email}%` };
    }

    if (createdAt) {
      where.createdAt = {
        [Op.gte]: new Date(createdAt),
      };
    }
    // ... другие условия для age, city, createdAt

    const results = await userModel.findAll({
      where,
      // ... другие опции
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Bunday foydalanuvchi topilmadi." });
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    console.error("Foydalanuvchini qidirishdagi xatolik:", error);
    res
      .status(500)
      .json({ message: "Foydalanuvchini qidirshda xatolik yuz berdi!" });
  }
}

// pagination ✅
export async function getAllUser(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await userModel.findAll({
      limit,
      offset,
      attributes: [
        "fullname",
        "role",
        "birth_date",
        "bolim",
        "lavozim",
        "talim_muassasasi",
        "malumoti",
        "talim_davri",
        "mutaxasisligi",
        "phone",
      ],
      include: {
        model: tasksModel,
        attributes: ["name", "status"],
      },
    });

    const totalUsers = await userModel.count();

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).send({
      users: result,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("user xatoligi", err);
    res
      .status(500)
      .send("Foydalanuvchilarni olishda xatolik yuz berdi: " + err.message);
  }
}
// get by ID ✅
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const { error } = getUserValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const result = await userModel.findByPk(id, {
      include: [{
        model: eduModel, // Specify the related model
        required: false,  // Whether to include users even if they don't have education records
      }]
    });
    

    if (!result) {
      return res.status(401).send("Bunday ID'lik foydalanuchi topilmadi!");
    }

    res.status(200).send(result);
  } catch (err) {
    console.log("get user", err);
    res
      .status(500)
      .send("Foydalanuvchini olishda xatolik yuz berdi: " + err.message);
  }
}

// hali to'liq emas 🔰
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updatedUser = req.body;
    // const { error: idError } = getUserValidator.validate(req.params);
    // if (idError) {
    //   return res.status(400).send(idError.details[0].message);
    // }
    const { error: bodyError } = updateUserValidator.validate(req.body);
    if (bodyError) {
      return res.status(400).send(bodyError.details[0].message);
    }
    const result = await userModel.update(updatedUser, {
      where: { user_id: id },
    });
    res.status(200).send(result);
  } catch (err) {
    res
      .status(500)
      .send("Foydalanuvchini yangilashda xatolik yuz berdi: " + err.message);
  }
}

//delete user from DB ✅
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const { error } = getUserValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const result = await userModel.destroy({ where: { user_id: id } });
    res.status(200).send({ result });
  } catch (err) {
    res
      .status(500)
      .send("Foydalanuvchini o'chirishda xatolik yuz berdi: " + err.message);
  }
}
