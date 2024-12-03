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
import * as socketConfig from "../../../common/config/socket.io.config.js";

// add Task ✅
export async function addTask(req) {
  try {
    const { title, status } = req.body;
    let { user_id } = req.body;

    // Faylni tekshirish
    if (!req.file) {
      throw new Error("Fayl yuklanmadi");
    }

    // Ruxsatni tekshirish
    const userRole = req.user?.role;
    console.log("User role:", userRole);
    if (userRole !== "admin") {
      throw new Error("Yangi vazifani faqat admin qo'shishi mumkin!");
    }

    // user_id ni massivga o'tkazish
    if (typeof user_id === "string") {
      try {
        user_id = JSON.parse(user_id);
      } catch (error) {
        throw new Error("Hodimlarning IDlari noto'g'ri formatda yuborilgan.");
      }
    }

    if (!user_id || !Array.isArray(user_id) || user_id.length === 0) {
      throw new Error("Topshiriqqa hech bo'lmaganda bitta hodim tanlang.");
    }

    // Fayl yo'li
    const filePath = req.file.destination + req.file.filename;

    // Yangi vazifa yaratish
    const newTask = {
      title,
      status,
      file: filePath,
    };

    // Tranzaksiya boshlanishi
    const transaction = await tasksModel.sequelize.transaction();

    // Vazifani hodimlar bilan bog'lash
    const taskAssignments = user_id.map((user_id) => ({
      task_id: result.task_id,
      user_id: user_id,
    }));
//{ transaction }
    try {
      const result = await tasksModel.create(newTask, taskAssignments);
      console.log("Created task:", result.toJSON());


      console.log("Task assignments to create:", taskAssignments);

      await user_taskModel.bulkCreate(taskAssignments, { transaction });

      // Tranzaksiyani tasdiqlash
      await transaction.commit();
      return result;

    } catch (err) {
      // Xatolik bo'lsa tranzaksiyani bekor qilish
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    console.error("Task creation error:", err);
    throw err;
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

    if (userRole === "admin") {
      // Admin barcha topshiriqlarni statusga qarab ko'rishi mumkin
      if (status === "jarayonda") {
        whereClause.status = "jarayonda";
      } else if (status === "bajarildi") {
        whereClause.status = "bajarildi";
      }
      // "barchasi" uchun hech qanday status filtr qo'llanmaydi (hamma topshiriqlar)
    } else if (userRole === "hodim") {
      // Hodim faqat o'ziga tegishli topshiriqlarni ko'rishi mumkin
      whereClause.task_id = userId;

      if (status === "bajarilgan topshiriqlar") {
        whereClause.status = "bajarildi";
      } else if (status === "bekor qilingan topshiriqlar") {
        whereClause.status = "bekor_qilindi";
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
      ],
    });

    // Umumiy topshiriqlar sonini hisoblash
    const totalTasks = await tasksModel.count({ where: whereClause });
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
      return res.status(403).send("Topshiriqni faqat admin tahrirlashi mumkin!");
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
    const result = await tasksModel.update(updatedTask, { where: { task_id: id } });
    if (result[0] === 0) {
      return res.status(404).send("Bunday ID'dagi topshiriq topilmadi yoki o'zgartirishlar kiritilmadi!");
    }

    res.status(200).send("Topshiriq muvaffaqiyatli yangilandi!");
  } catch (err) {
    console.error("Xatolik:", err.message);
    res.status(500).send("Topshiriqni yangilashda xatolik: " + err.message);
  }
}


// export async function updateTask(req, res) {
//   try {
//     const { id } = req.params;
//     const updatedTask = req.body;
//     const userRole= req.user?.role;

//     if (userRole !== "admin") {
//       return res.status(403).send("Topshiriqni faqat admin  tahrirlashi mumkin!");
//     }

//     const oldDataTask = await tasksModel.findOne({ where: { task_id: id } });
//     if (!oldDataTask) {
//       return res.status(404).send("Bunday ID'dagi topshiriq topilmadi!");
//     }

    
//     if (req.file) {
//       // Delete old picture if it exists and is not the default
//       if (oldDataTask.file && oldDataTask.file !== "default-ava.png") {
//         const oldPicturePath = path.join(
//           "./uploads/admin-task",
//           oldDataTask.file
//         );
//         try {
//           if (fs.existsSync(oldPicturePath)) {
//             fs.unlinkSync(oldPicturePath);
//           }
//         } catch (error) {
//           console.error("Error deleting old picture:", error);
//         }
//       }
//       // Delete old file if it exists
//       if (oldDataUser.file) {
//         try {
//           if (fs.existsSync(oldDataTask.file)) {
//             fs.unlinkSync(oldDataTask.file);
//           }
//         } catch (error) {
//           console.error("Error deleting old file:", error);
//         }
//       }
//       // Set new picture and file path
//       newPicture = req.file.filename;
//       newFile = req.file.path;
//     }

//     const result = await tasksModel.update(updatedTask, { where: {task_id: id } });
//     console.log("result", result);

//     if (result[0] === 0) {
//       return res.status(404).send("Bunday id dagi xona topilmadi!!");
//     }

//     res.status(200).send(result);
//   } catch (err) {
//     res
//       .status(500)
//       .send("Xona turini yangilashda xatolik bo'ldi: " + err.message);
//   }
// }

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const userRole= req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).send("Topshiriqni faqat admin o'chirishi mumkin!");
    }

    const { error: idError } = getTaskValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }

    const result = await tasksModel.destroy({ where: { task_id: parseInt(id) } });

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
