import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";

const tasksModel = sequelize.define("tasks", {
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "Qo'shimcha izoh yoq",
  },

  file: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM(
      "yuborildi",
      "jarayonda",
      "bajarildi",
      "bekor qilindi"
    ),
    defaultValue: "yuborildi",
    allowNull: true,
  },
});

export default tasksModel;
