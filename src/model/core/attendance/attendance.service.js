import { Op } from "sequelize";
import { attendanceModel } from "./attendance.model.js";
//

// ===                  Hali toliq emas             ===

//
export async function addAttendance(req, res) {
  try {
    const { userId, date, status } = req.body;

    const newAttendance = await attendanceModel.create({
      userId,
      date,
      status,
    });

    res.status(201).send(newAttendance);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function getAttendance(req, res) {
  try {
    const { userId, startDate, endDate } = req.query;

    const attendances = await attendanceModel.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    res.status(200).send(attendances);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function updateAttendance(req, res) {
  try {
    const { attendanceId, status } = req.body;

    const attendance = await attendanceModel.findByPk(attendanceId);

    if (!attendance) {
      return res.status(404).send("Attendance not found");
    }

    await attendance.update({ status });

    res.status(200).send(attendance);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
