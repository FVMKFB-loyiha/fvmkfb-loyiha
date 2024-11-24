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

  file: {
    type: DataTypes.STRING,
  },

  status: {
    type: DataTypes.ENUM('jarayonda', 'bajarildi', 'bekor qilindi'),
    defaultValue: 'jarayonda',
    allowNull: true,
  },
});

export default tasksModel;
