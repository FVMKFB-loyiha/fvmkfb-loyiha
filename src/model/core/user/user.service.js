import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getConfig from "../../../common/config/config.service.js";
// import searchUsers from "../../../common/utils/search.js";
import fileSysteam from "fs";
import { Op } from "sequelize";
import userModel from "./user.model.js";

import {
  getUserValidator,
  loginUserValidator,
  registerUserValidator,
  updateUserValidator,
} from "../../validator/userValidator.js";
import tasksModel from "../task/task.model.js";

export async function registerUser(req, res) {
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
      newUser.rasm = req.file.destination + req.file.filename;
    }
    let borFoydalanuvchilar = fayldanOqish("rasm.json");

    if (!borFoydalanuvchilar) {
      borFoydalanuvchilar = [];
      faylgaYozish("rasm.json", [newUser]);
      console.log("foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi");
    } else {
      borFoydalanuvchilar.push(newUser);
      faylgaYozish("rasm.json", borFoydalanuvchilar);
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
        "Foydalanuvchini ro'yxatdan o'tkazishda xatolik yuz berdi: " +
          err.message
      );
  }
}

export function faylgaYozish(manzil, malumot) {
  fileSysteam.writeFileSync(manzil, JSON.stringify(malumot));
}

export function fayldanOqish(manzil) {
  try {
    const fayilMavjudligi = fileSysteam.existsSync(manzil);
    if (!fayilMavjudligi) return null; // Fayl topilmasa null qaytaramiz

    const malumotlarString = fileSysteam.readFileSync(manzil);
    const malumot = JSON.parse(malumotlarString);
    return malumot;
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

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const { error } = loginUserValidator.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      return res.status(404).send("Foydalanuvchi topilmadi.");
    }

    const postmandagiLoginMalumotlari = req.body;
    const borFoydalanuvchilar = fayildanOqish("foydalanuvchilar.json");
    for (let i = 0; i < borFoydalanuvchilar.length; i = i + 1) {
      if (
        borFoydalanuvchilar[i].email === postmandagiLoginMalumotlari.email &&
        borFoydalanuvchilar[i].password === postmandagiLoginMalumotlari.password
      ) {
        return res.send("siz tizimga muvaffaqiyatli kirdiz");
      }
    }

    res.status(200).send({
      token: await generateToken({ email: existingUser.email }),
    });
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    res.status(500).send("Login jarayonida xatolik yuz berdi: " + err.message);
  }
}

function generateToken(data) {
  return jwt.sign(data, getConfig("JWT_SECRET"), { expiresIn: "1d" });
}

export async function searchUserController(req, res) {
  try {
    const {
      searchTerm,
      ism_familiya,
      bolim,
      lavozim,
      malumoti,
      email,
      createdAt,
    } = req.query;

    let where = {};

    if (searchTerm) {
      where[Op.or] = [
        { ism_familiya: { [Op.iLike]: `%${searchTerm}%` } },
        { bolim: { [Op.iLike]: `%${searchTerm}%` } },
        { lavozim: { [Op.iLike]: `%${searchTerm}%` } },
        { malumoti: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { createdAt: { [Op.gte]: `%${searchTerm}%` } },
      ];
    }

    if (ism_familiya) {
      where.ism_familiya = { [Op.iLike]: `%${ism_familiya}%` };
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

export async function getAllUser(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await userModel.findAll({
      limit,
      offset,
      // ... other options (e.g., sorting, filtering)
      attributes: [
        "ism_familiya",
        "role",
        "tugilgan_sana",
        "bolim",
        "lavozim",
        "talim_muassasasi",
        "malumoti",
        "talim_davri",
        "mutaxasisligi",
        "telefon_nomeri",
      ],
      include: {
        model: tasksModel,
        attributes: ["name", "status"],
      },
    });

    const totalUsers = await userModel.count();

    const jamiSahifalar = Math.ceil(totalUsers / limit);

    res.status(200).send({
      users: result,
      jamiSahifalar,
      joriySahifa: page,
    });
  } catch (err) {
    console.error("user xatoligi", err);
    res
      .status(500)
      .send("Foydalanuvchilarni olishda xatolik yuz berdi: " + err.message);
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const { error } = getUserValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const result = await userModel.findByPk(id);

    if (!result) {
      res
        .status(401)
        .send("bunday id dagi foydalanuvchi yo'q yoki o'chirilgan!");
    }

    res.status(200).send(result);
  } catch (err) {
    console.log("get user", err);
    res
      .status(500)
      .send("Foydalanuvchini olishda xatolik yuz berdi: " + err.message);
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updatedUser = req.body;
    const { error: idError } = getUserValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }
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
