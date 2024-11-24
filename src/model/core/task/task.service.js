import {
  addTaskValidator,
  getTaskValidator,
  updateTaskValidator,
} from "../../validator/taskValidator.js";
import userModel from "../user/user.model.js";
import { fayldanOqish, faylgaYozish } from "../user/user.service.js";
import tasksModel from "./task.model.js";

export async function addTask(req, res) {
  try {
    const { newTask } = req.body;
    if (!req.file) {
      return res.status(400).send("Fayl yuklanmadi");
    }

    console.log("Yangi vazifa (fayl bilan):", newTask);
    const { error } = addTaskValidator.validate(newTask);
    if (error) {
      console.log("Validatsiya xatoligi:", error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }

    if (req.file) {
      newTask.file = req.file.destination + req.file.filename;
    }
    let borVazifalar = fayldanOqish("file.json");

    if (!borVazifalar) {

      borVazifalar = [];
      
      faylgaYozish("file.json", [newTask]);
      console.log("foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi");
    } else {
      borVazifalar.push(newTask);
      faylgaYozish("file.json", borVazifalar);
    }

    const result = await tasksModel.create(newTask); // Bazaga yozish
    res
      .status(201)
      .send({ message: "Ma'lumotlar muvaffaqiyatli qo'shildi", result });
  } catch (err) {
    console.log("TASK XATOLIGI=> ", err);
    res.status(500).send("Yangi xona qo'shishda xatolik bo'ldi" + err.message);
  }
}

export async function getAllTask(req, res) {
  try {
    const result = await tasksModel.findAll({
      attributes: ["tasks_id", "name", "status"],
      include: {
        model: userModel,
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
      },
    });
    res.status(200).send(result);
  } catch (err) {
    console.log("tasks error", err);
    res
      .status(500)
      .send(
        "Qanday xonalar mavjudligi haqidagi ma'lumotlarni olishda xatolik bo'ldi: " +
          err.message
      );
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const updatedTask = req.body;
    const { error: idError } = getTaskValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }
    const { error: bodyError } = updateTaskValidator.validate(req.body);
    if (bodyError) {
      return res.status(400).send(bodyError.details[0].message);
    }

    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(403).send("Sizga buni amalga oshirishga ruxsat yo'q!");
    }
    const result = await tasksModel.update(updatedTask, { where: { id } });
    console.log("result", result);

    if (result[0] === 0) {
      return res.status(404).send("Bunday id dagi xona topilmadi!!");
    }

    res.status(200).send(result);
  } catch (err) {
    res
      .status(500)
      .send("Xona turini yangilashda xatolik bo'ldi: " + err.message);
  }
}

export async function getTask(req, res) {
  try {
    const { id } = req.params;
    const { error } = getTaskValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const result = await tasksModel.findByPk(id);

    if (!result) {
      return res.status(404).send("Bizda xali bunday xona mavjud emas!");
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Xona turini olishda xatolik bo'ldi: " + err.message);
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const { error: idError } = getTaskValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }

    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(403).send("Sizga buni amalga oshirishga ruxsat yo'q!");
    }

    const result = await tasksModel.destroy({ where: { id: parseInt(id) } });

    if (!result) {
      return res.status(404).send("Bizda xali bunday Xona mavjud emas !");
    }
    console.log("result", result);

    res.status(200).send("o'chirildi");
  } catch (err) {
    console.log(err);
    res.status(500).send("Xonani o'chirishda xatolik bo'ldi: " + err.message);
  }
}
