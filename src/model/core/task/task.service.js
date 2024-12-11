import { log } from "console";
import {
  addTaskValidator,
  getTaskValidator,
  updateTaskValidator,
} from "../../validator/taskValidator.js";
import { user_taskModel } from "../index.js";
import userModel from "../user/user.model.js";
import tasksModel from "./task.model.js";
import fs from "fs";
import path from "path";
// import * as socketConfig from "../../../common/config/socket.io.config.js";

// add Task ✅
export async function addTask(req, res) {
  let transaction; // Tranzaksiya global scope'da e'lon qilindi

  try {
    const { title, status } = req.body;
    let { user_id } = req.body;

    if (!req.file) {
      throw new Error("Fayl yuklanmadi");
    }

    if (!req.user || req.user?.role !== "admin") {
      throw new Error("Yangi vazifani faqat admin qo'shishi mumkin!");
    }

    if (!Array.isArray(user_id)) {
      try {
        user_id = JSON.parse(user_id);
        if (!Array.isArray(user_id)) {
          throw new Error();
        }
      } catch {
        throw new Error("Hodimlarning IDlari noto'g'ri formatda yuborilgan.");
      }
    }
    
    log(user_id);
    if (!user_id || !Array.isArray(user_id) || user_id.length === 0) {
      throw new Error("Topshiriqqa hech bo'lmaganda bitta hodim tanlang.");
    }

    const filePath = req.file.destination + req.file.filename;

    const newTask = {
      title,
      status,
      file: filePath,
    };

    transaction = await tasksModel.sequelize.transaction(); // Tranzaksiya yaratish

    const result = await tasksModel.create(newTask, { transaction });

    console.log("Created task:", result.toJSON());

    const taskAssignments = user_id.map((user_id) => ({
      task_id: result.dataValues.task_id,
      user_id: user_id,
    }));

    console.log("Task assignments to create:", taskAssignments);

    await user_taskModel.bulkCreate(taskAssignments, { transaction });

    await transaction.commit(); // Tranzaksiya muvaffaqiyatli yakunlandi
    return res.send(result); // Natija qaytariladi
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback(); // Faqat tranzaksiya mavjud bo'lsa rollback qilinadi
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }
    console.error("Xatolik yuz berdi:", err.message);
    res.status(500).send({ error: err.message }); // Xatolikni qaytarish
  }
}

// hodim vazifani qabul qilishi✅
export async function handleXodimDecision(req, res) {
  try {
    const { task_id, status } = req.body;

    // Validatsiya qilish
    if (!task_id || !status) {
      return res
        .status(400)
        .send("task_id va status maydonlarini kiritish majburiy.");
    }

    // Faqat "accept" yoki "reject" statuslarini qabul qilish
    if (!["accept", "reject"].includes(status)) {
      return res
        .status(400)
        .send(
          "Noto'g'ri status qiymati. Faqat 'accept' yoki 'reject' bo'lishi mumkin."
        );
    }

    // Bazadan vazifa ma'lumotlarini olish
    const task = await tasksModel.findOne({ where: { task_id } });

    if (!task) {
      return res.status(404).send("Bunday vazifa topilmadi.");
    }

    // Holatni tekshirish: Faqat "kutilmoqda" yoki "jarayonda" holatida o'zgarishi mumkin
    if (!["yuborildi", "jarayonda"].includes(task.status)) {
      return res
        .status(400)
        .send("Bu vazifa holatini o'zgartirishga ruxsat yo'q.");
    }

    // Fayl manzilini tekshirish
    if (!task.file) {
      return res.status(400).send("Vazifaga hech qanday fayl biriktirilmagan.");
    }

    // Statusni yangilash
    const newStatus = status === "accept" ? "jarayonda" : "bekor qilindi";

    await tasksModel.update({ status: newStatus }, { where: { task_id } });

    // Javob qaytarish
    res.status(200).send({
      message: `Vazifa holati muvaffaqiyatli qabul qilindi: ${newStatus}`,
      fileUrl: task.file, // Faylni yuklab olish uchun manzil
    });
  } catch (err) {
    console.log("TASK STATUS XATOLIGI=> ", err);
    res
      .status(500)
      .send("Statusni yangilashda xatolik yuz berdi: " + err.message);
  }
}

// xodim qabul qilingan vazifani qaytadan yuklashi✅
export async function handleTaskCompletion(req, res) {
  try {
    const { task_id, comment } = req.body;

    console.log("hande task completion body=>", req.body);
    console.log("hande task completion file=>", req.file);

    // Validatsiya qilish
    if (!task_id || !comment === 0) {
      return res
        .status(400)
        .send("task_id, comment maydonlarini kiritish majburiy.");
    }

    // Bazadan vazifa ma'lumotlarini olish
    const task = await tasksModel.findOne({ where: { task_id } });

    if (!task) {
      return res.status(404).send("Bunday vazifa topilmadi.");
    }

    if (!req.file) {
      return res.status(400).send("Fayl topilmadi!");
    }

    // Faqat "jarayonda" holatdagi vazifani bajarilgan deb belgilash mumkin
    if (task.status !== "jarayonda") {
      return res
        .status(400)
        .send(
          "Faqat 'jarayonda' holatdagi vazifani bajarilgan deb belgilash mumkin."
        );
    }

    const filePath = req.file.destination + req.file.filename;

    // Izohni va statusni yangilash
    await tasksModel.update(
      {
        status: "bajarildi",
        filePath,
        comment, // Izohni saqlash
      },
      { where: { task_id } }
    );

    res.status(200).send({
      message: "Vazifa muvaffaqiyatli bajarildi.",
      fileUrl: filePath,
    });
  } catch (err) {
    console.log("TASK COMPLETION XATOLIGI=> ", err);
    res
      .status(500)
      .send(
        "Vazifani bajarilgan deb belgilashda xatolik yuz berdi: " + err.message
      );
  }
}

export async function getAllTask(req, res) {
  try {
    const { page = 1, limit = 10, status = "barchasi" } = req.query; // Status va pagination uchun query parametrlar
    const offset = (page - 1) * limit;

    // Foydalanuvchi ma'lumotlarini olish (req.user dan keladi deb hisoblaymiz)
    const userRole = req.user?.role; // admin yoki hodim
    const userId = req.user?.user_id;

    // Filtr parametrlarini tayyorlash
    const whereClause = {};
    const userTaskWhereClause = {};

    if (userRole === "admin") {
      // Admin barcha topshiriqlarni statusga qarab ko'rishi mumkin
      if (status === "jarayonda") {
        whereClause.status = "jarayonda";
      } else if (status === "bajarildi") {
        whereClause.status = "bajarildi";
      }
      // "barchasi" uchun hech qanday status filtr qo'llanmaydi
    } else if (userRole === "hodim") {
      // Hodim faqat o'ziga tegishli topshiriqlarni ko'rishi mumkin
      userTaskWhereClause.user_id = userId;

      if (status === "bajarildi") {
        whereClause.status = "bajarildi";
      } else if (status === "bekor qilindi") {
        whereClause.status = "bekor qilindi";
      }
      // "barcha topshiriqlar" uchun hech qanday status filtr qo'llanmaydi
    } else {
      return res.status(403).send({
        error: "Ruxsat berilmagan",
        message: "Siz bu ma'lumotlarga kirish huquqiga ega emassiz",
      });
    }

    // So'rovni ma'lumotlar bazasidan olish
    const result = await tasksModel.findAll({
      where: whereClause,
      limit,
      offset,
      attributes: ["task_id", "title", "comment", "status"],
      include: [
        {
          model: userModel,
          required: false,
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
        },
        {
          model: user_taskModel, // Hodim va vazifa bog'lanishini tekshirish uchun
          required: userRole === "hodim", // Hodim bo'lsa bu ulanish talab qilinadi
          attributes: [],
          where: userTaskWhereClause,
        },
      ],
    });

    // Umumiy topshiriqlar sonini hisoblash
    const totalTasks = await tasksModel.count({
      where: whereClause,
      include:
        userRole === "hodim"
          ? [
              {
                model: user_taskModel,
                required: true,
                where: userTaskWhereClause,
              },
            ]
          : [],
    });

    const totalPages = Math.ceil(totalTasks / limit);

    // Natijani qaytarish
    res.status(200).send({
      tasks: result,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("Xatolik yuz berdi", err);
    res.status(500).send({
      error: "Serverda xatolik yuz berdi",
      message: err.message,
    });
  }
}

export async function getTask(req, res) {
  try {
    const { id } = req.params;
    const { error } = getTaskValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const result = await tasksModel.findByPk(id, {
      include: [
        {
          model: userModel,
          required: false,
        },
      ],
    });

    if (!result) {
      return res.status(404).send("Bizda xali bunday xona mavjud emas!");
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Xona turini olishda xatolik bo'ldi: " + err.message);
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const updatedTask = req.body;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res
        .status(403)
        .send("Topshiriqni faqat admin tahrirlashi mumkin!");
    }

    const oldDataTask = await tasksModel.findOne({ where: { task_id: id } });
    if (!oldDataTask) {
      return res.status(404).send("Bunday ID'dagi topshiriq topilmadi!");
    }

    if (req.file) {
      // Fayl mavjud bo'lsa eski faylni o'chirib yangi faylni saqlash
      if (oldDataTask.file) {
        const oldFilePath = path.join("./uploads/admin-task", oldDataTask.file);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath); // Eski faylni o'chirish
          }
        } catch (error) {
          console.error("Error deleting old file:", error);
        }
      }

      // Yangi fayl nomini `updatedTask.file` ga yozish
      updatedTask.file = req.file.filename;
    } else {
      // Fayl mavjud bo'lmasa eski faylni saqlab qolish
      updatedTask.file = oldDataTask.file;
    }

    // Taskni yangilash
    const result = await tasksModel.update(updatedTask, {
      where: { task_id: id },
    });
    if (result[0] === 0) {
      return res
        .status(404)
        .send(
          "Bunday ID'dagi topshiriq topilmadi yoki o'zgartirishlar kiritilmadi!"
        );
    }

    res.status(200).send("Topshiriq muvaffaqiyatli yangilandi!");
  } catch (err) {
    console.error("Xatolik:", err.message);
    res.status(500).send("Topshiriqni yangilashda xatolik: " + err.message);
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).send("Topshiriqni faqat admin o'chirishi mumkin!");
    }

    const { error: idError } = getTaskValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }

    const result = await tasksModel.destroy({
      where: { task_id: parseInt(id) },
    });

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
