import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";

const tasksModel = sequelize.define("tasks", {
  tasks_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  file: {
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
