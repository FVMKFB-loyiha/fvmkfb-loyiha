import {
  addTaskValidator,
  getTaskValidator,
  updateTaskValidator,
} from "../../validator/taskValidator.js";
import { user_taskModel } from "../index.js";
import userModel from "../user/user.model.js";
// import eduModel from "../user/userEdu.model.js";
// import { readFromFile, writeToFile } from "../user/user.service.js";
import tasksModel from "./task.model.js";


// add Task ✅
export async function addTask(req, res) {
  try {
    const { title, status } = req.body; // `title` va `status`ni olish
    let { user_id } = req.body; // Hodimlarning IDlari form-data orqali keladi

    console.log("Kelgan ma'lumotlar:", req.body);

    if (!req.file) {
      return res.status(400).send("Fayl yuklanmadi");
    }

    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).send("Yangi vazifani faqat admin qo'shishi mumkin!");
    }

    // `user_id`ni massivga aylantirish (agar kerak bo'lsa)
    if (typeof user_id === "string") {
      try {
        user_id = JSON.parse(user_id); // Stringni massivga aylantirish
      } catch (error) {
        return res.status(400).send("Hodimlarning IDlari noto'g'ri formatda yuborilgan.");
      }
    }

    if (!user_id || !Array.isArray(user_id) || user_id.length === 0) {
      return res.status(400).send("Topshiriqqa hech bo'lmaganda bitta hodim tanlang.");
    }

    console.log("Tanlangan hodimlar IDlari:", user_id);

    // Hodimlarning mavjudligini tekshirish
    const employees = await userModel.findAll({
      where: {
        user_id: user_id,
      },
    });

    if (employees.length !== user_id.length) {
      return res.status(400).send("Ba'zi tanlangan hodimlar mavjud emas yoki noto'g'ri.");
    }

    // Fayl manzilini olish
    const filePath = req.file.destination + req.file.filename;

    // Yangi vazifani yaratish
    const newTask = {
      title,
      status,
      file: filePath,
    };

    const result = await tasksModel.create(newTask);

    // Vazifani hodimlar bilan bog'lash
    const taskAssignments = user_id.map((user_id) => ({
      task_id: result.task_id,
      user_id: user_id,
    }));

    await user_taskModel.bulkCreate(taskAssignments);

    res.status(201).send({ message: "Ma'lumotlar muvaffaqiyatli qo'shildi", result });
  } catch (err) {
    console.log("TASK XATOLIGI=> ", err);
    res.status(500).send("Yangi vazifa qo'shishda xatolik bo'ldi: " + err.message);
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
    const { task_id, comment} = req.body;

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




// export async function getAllTask(req, res) {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;

//     const result = await tasksModel.findAll({
//       limit,
//       offset,
//       attributes: [
//          "task_id" ,"title", "comment", "status"
//       ],
//       include: [
//         {
//           model: userModel,
//           required: false,
//           attributes: [
//             "fullname",
//             "email",
//             "birth_date",
//             "picture",
//             "file",
//             "department",
//             "position",
//             "phone",
//           ],
//         }
//       ],
//     });

//     const totalTAsks = await tasksModel.count();

//     const totalPages = Math.ceil(totalTAsks / limit);

//     res.status(200).send({
//       users: result,
//       totalPages,
//       currentPage: page,
//     });
//   } catch (err) {
//     console.error("user xatoligi", err);
//     res
//       .status(500)
//       .send("Foydalanuvchilarni olishda xatolik yuz berdi: " + err.message);
//   }
// }

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
