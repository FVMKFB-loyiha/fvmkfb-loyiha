import {
  addUser_taskValidator,
  getUser_taskValidator,
  updateUser_taskValidator,
} from "../../validator/user_taskValidator.js";
import user_taskModel from "./user_task.model.js";

export async function addUserTask(req, res) {
  try {
    const newUserTask = req.body;
    const { error } = addUser_taskValidator.validate(newUserTask);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const result = await user_taskModel.create(newUserTask);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send("Yangi xona qo'shishda xatolik bo'ldi" + err.message);
  }
}

export async function getAllUserTask(req, res) {
  try {
    const result = await user_taskModel.findAll();
    res.status(200).send(result);
  } catch (err) {
    res
      .status(500)
      .send(
        "Qanday xonalar mavjudligi haqidagi ma'lumotlarni olishda xatolik bo'ldi: " +
          err.message
      );
  }
}

export async function updateUserTask(req, res) {
  try {
    const { id } = req.params;
    const updatedTask = req.body;
    const { error: idError } = getUser_taskValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }
    const { error: bodyError } = updateUser_taskValidator.validate(req.body);
    if (bodyError) {
      return res.status(400).send(bodyError.details[0].message);
    }

    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(403).send("Sizga buni amalga oshirishga ruxsat yo'q!");
    }
    const result = await user_taskModel.update(updatedTask, { where: { id } });
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

export async function getUserTask(req, res) {
  try {
    const { id } = req.params;
    const { error } = getUser_taskValidator.validate(req.params);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const result = await user_taskModel.findByPk(id);

    if (!result) {
      return res.status(404).send("Bizda xali bunday xona mavjud emas!");
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Xona turini olishda xatolik bo'ldi: " + err.message);
  }
}
export async function deleteUserTask(req, res) {
  try {
    const { id } = req.params;
    const { error: idError } = getUser_taskValidator.validate(req.params);
    if (idError) {
      return res.status(400).send(idError.details[0].message);
    }

    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(403).send("Sizga buni amalga oshirishga ruxsat yo'q!");
    }

    const result = await user_taskModel.destroy({
      where: { id: parseInt(id) },
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
