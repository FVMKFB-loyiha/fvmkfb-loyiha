import jwt from "jsonwebtoken";
import getDotEnv from "../../../common/config/dotenv.config.js";
import { Op, where } from "sequelize";
import userModel from "./user.model.js";
import path from "path";
import fs from "fs";

import {
  getUserValidator,
  loginUserValidator,
  registerUserValidator,
  updateUserValidator,
} from "../../validator/userValidator.js";
import tasksModel from "../task/task.model.js";
import eduModel from "./userEdu.model.js";
import chalk from "chalk";
import FamilyMember from "./user.family.model.js";
// import { profilePicMiddleware } from "../../../middlewares/rasmYuklash.js";

// rasm saqlanadigan direktoriya
const uploadDir = "../uploads/userphotos/";

// functions
export const findUserByEmail = async function (email) {
  return await userModel.findOne({
    where: { email },
  });
};

function generateToken(data) {
  return jwt.sign(data, getDotEnv("JWT_SECRET"), { expiresIn: "1d" });
}

// register user service ✅
export async function registerUser(req, res) {
  try {
    const {
      fullname,
      email,
      role,
      birth_date,
      department,
      position,
      phone,
      edu,
    } = req.body;

    let picture = req.file ? req.file.filename : "default-ava.png";
    let filePath = req.file ? req.file.path : uploadDir + "default-ava.png";

    const { error } = registerUserValidator.validate({
      fullname,
      email,
      role,
      birth_date,
      department,
      position,
      phone,
    });
    if (error) {
      console.log("Validatsiya xatoligi:", error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }

    let eduParse = JSON.parse(edu);

    const user = await userModel.create({
      fullname,
      email,
      role,
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

export async function userFamilyInfo(req, res) {
  const familyInfo = req.body;

  if (!Array.isArray(familyInfo)) {
    return res.json({
      success: false,
      message: "Invalid data format, send it in json format!",
    });
  }

  const createdMembers = await FamilyMember.insertMany(familyInfo);

  if (!createdMembers) {
    res.status(500).send({
      success: false,
      message: "Something went wrong when saving data to database",
    });
  } else {
    res.send({
      success: true,
      data: createdMembers,
    });
  }
}

// login user ✅
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
      const token = generateToken({
        id: existingUser.user_id,
        email: existingUser.email,
        role: existingUser.role,
      });

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
      res.status(401).send("Parol yoki elektron pochta xato");
    }
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    res.status(500).send("Login jarayonida xatolik yuz berdi: " + err.message);
  }
}

// soring users ✅
export async function searchUserController(req, res) {
  try {
    const allowedFilters = [
      "searchTerm",
      "fullname",
      "department",
      "position",
      "degree",
      "email",
      "createdAt",
    ];
    const filters = Object.keys(req.query);

    // Noto'g'ri parametrlarga ishlov berish
    const invalidFilters = filters.filter(
      (key) => !allowedFilters.includes(key)
    );
    if (invalidFilters.length > 0) {
      return res.status(400).json({
        message: `Noto'g'ri so'rov parametrlari: ${invalidFilters.join(", ")}`,
      });
    }

    const {
      searchTerm,
      fullname,
      department,
      position,
      degree,
      email,
      createdAt,
    } = req.query;

    let where = {};
    let eduWhere = {}; // userEdu modeli uchun filter

    // searchTerm orqali qidirish
    if (searchTerm) {
      where[Op.or] = [
        { fullname: { [Op.iLike]: `%${searchTerm}%` } },
        { department: { [Op.iLike]: `%${searchTerm}%` } },
        { position: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
      ];

      eduWhere.degree = { [Op.iLike]: `%${searchTerm}%` };
    }

    // Qo'shimcha filtrlar
    if (fullname) {
      where.fullname = { [Op.iLike]: `%${fullname}%` };
    }
    if (department) {
      where.department = { [Op.iLike]: `%${department}%` };
    }
    if (position) {
      where.position = { [Op.iLike]: `%${position}%` };
    }
    if (degree) {
      eduWhere.degree = { [Op.iLike]: `%${degree}%` };
    }
    if (email) {
      where.email = { [Op.iLike]: `%${email}%` };
    }
    if (createdAt) {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        where.createdAt = { [Op.gte]: date };
      }
    }

    // Foydalanuvchilarni qidirish
    const results = await userModel.findAll({
      where,
      include: [
        {
          model: eduModel, // userEdu modelini qo'shamiz
          where: eduWhere, // userEdu uchun filter
          required: degree || searchTerm ? true : false, // degree yoki searchTerm mavjud bo'lsa, majburiy join
        },
      ],
      attributes: [
        "user_id",
        "fullname",
        "department",
        "position",
        "email",
        "createdAt",
      ], // Faqat kerakli maydonlarni qaytaring
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Bunday foydalanuvchi topilmadi." });
    } else {
      return res.status(200).json(results);
    }
  } catch (error) {
    console.error("Foydalanuvchini qidirishdagi xatolik:", error);
    return res.status(500).json({
      message: "Foydalanuvchini qidirishda xatolik yuz berdi!",
    });
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
        "user_id",
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
          attributes: ["title", "status"],
        },
        {
          model: eduModel,
          required: false,
          attributes: ["edu_name", "degree", "specialty", "study_year"],
        },
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

// get by ID ✅
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

// update user ✅
export async function updateUser(req, res) {
  try {
    let { id } = req.params;
    id = id * 1; // numeric ID

    const oldDataUser = await userModel.findOne({ where: { user_id: id } });
    if (!oldDataUser) {
      return res.status(404).send("Bunday ID'lik foydalanuchi topilmadi!");
    }

    const { fullname, email, birth_date, department, position, phone } =
      req.body;

    // Handle picture update
    let newPicture = oldDataUser.picture; // Default to old picture
    let newFile = oldDataUser.file; // Default to old file path

    if (req.file) {
      // Delete old picture if it exists and is not the default
      if (oldDataUser.picture && oldDataUser.picture !== "default-ava.png") {
        const oldPicturePath = path.join(
          "./uploads/userphotos",
          oldDataUser.picture
        );
        try {
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        } catch (error) {
          console.error("Error deleting old picture:", error);
        }
      }
      // Delete old file if it exists
      if (oldDataUser.file) {
        try {
          if (fs.existsSync(oldDataUser.file)) {
            fs.unlinkSync(oldDataUser.file);
          }
        } catch (error) {
          console.error("Error deleting old file:", error);
        }
      }
      // Set new picture and file path
      newPicture = req.file.filename;
      newFile = req.file.path;
    }

    const updatedDataUser = {
      fullname: fullname || oldDataUser.fullname,
      email: email || oldDataUser.email,
      birth_date: birth_date || oldDataUser.birth_date,
      department: department || oldDataUser.department,
      position: position || oldDataUser.position,
      phone: phone || oldDataUser.phone,
      picture: newPicture,
      file: newFile,
    };

    const result = await userModel.update(updatedDataUser, {
      where: { user_id: id },
      returning: true,
    });

    const updatedUser = await userModel.findOne({
      where: { user_id: id },
    });

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
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

    if (result) {
      return res.status(200).send({ result });
    } else {
      return res.status(404).send({ result });
    }
  } catch (err) {
    res
      .status(500)
      .send("Foydalanuvchini o'chirishda xatolik yuz berdi: " + err.message);
  }
}
