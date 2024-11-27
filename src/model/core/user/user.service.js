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

// rasm saqlanadigan direktoriya
const uploadDir = "../uploads/userphotos";

// functions
export const findUserByEmail = async function (email) {
  return await userModel.findOne({
    where: { email },
  });
};

function generateToken(data) {
  return jwt.sign(data, getDotEnv("JWT_SECRET"), { expiresIn: "1d" });
}

// register user service 
export async function registerUser(req, res) {
  try {
    const { fullname, email, birth_date, department, position, phone, edu } =
      req.body;

    let picture = req.file ? req.file.filename : "default-ava.jpg";
    let filePath = req.file ? req.file.path : null;

    let eduParse = JSON.parse(edu);

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

// hali to'liq emas 
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
      const token = generateToken({ email: existingUser.email, role: "hodim" });

      // Cookie ni sozlash
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 soat
      });

      res.status(200).json({
        message: "siz tizimga muvaffaqiyatli kirdiz",
        token,
      });
    } else {
      res.send("parol notog'ri");
    }
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    res.status(500).send("Login jarayonida xatolik yuz berdi: " + err.message);
  }
}

// sorting users 
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
        "email",
        "birth_date",
        "picture",
        "file",
        "department",
        "position",
        "phone",
      ],
      include: [
        {
          model: tasksModel,
          required: false,
          attributes: ["name", "status"]
        },
        {
          model: eduModel,
          required: false,
          attributes: ["edu_name", "degree", "specialty","study_year"]
        }
      ],
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
// get by ID 
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const { error } = getUserValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const result = await userModel.findByPk(id, {
      include: [
        {
          model: eduModel,
          required: false,
        },
      ],
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

// update user hali to'liq emas 
export async function updateUser(req, res) {
  try {
    let { id } = req.params;
    id = id * 1; // numeric ID
  
    const { fullname, email, birth_date, department, position, phone, edu } = req.body;
    const eduParse = edu ? JSON.parse(edu) : [];

    const { error: idError } = getUserValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }

    const oldDataUser = await userModel.findOne(id);
    console.log(oldDataUser);
    if (!oldDataUser) {
      return res.status(404).send("Bunday ID'lik foydalanuchi topilmadi!");
    }

    const updatedDataUser = {
      fullname: fullname || oldDataUser.fullname,
      email: email || oldDataUser.email,
      birth_date: birth_date || oldDataUser.birth_date,
      department: department || oldDataUser.department,
      position: position || oldDataUser.position,
      phone: phone || oldDataUser.phone,
    };

    const [affectedCount, updatedRows] = await userModel.update(updatedDataUser, {
      where: { user_id: id },
      returning: true,
    });

    if (affectedCount === 0) {
      return res.status(404).send("Bunday ID'lik foydalanuchi topilmadi!");
    }

    if (edu && Array.isArray(eduParse)) {
      await Promise.all(
        eduParse.map(async (eduItem) => {
          const existingEdu = await eduModel.findOne({
            where: { user_id: oldDataUser.user_id, edu_name: eduItem.edu_name },
          });

          if (existingEdu) {
            await existingEdu.update(eduItem);
          } else {
            await eduModel.create({ ...eduItem, user_id: oldDataUser.user_id });
          }
        })
      );
    }

    res.json(updatedRows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json(err.message);
  }
}


//delete user from DB 
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
