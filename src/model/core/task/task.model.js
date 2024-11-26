import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";

const tasksModel = sequelize.define("tasks", {
  tasks_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  file_path: {
    type: DataTypes.STRING,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('kutilmoqda','jarayonda', 'bajarildi', 'bekor qilindi'),
    defaultValue: 'kutilmoqda',
    allowNull: true,
  },
});

export default tasksModel;
