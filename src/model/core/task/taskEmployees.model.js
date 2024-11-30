import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";
import userModel from "../user/user.model.js";
import tasksModel from "./task.model.js";

const taskEmployesModel = sequelize.define(
  "taskEmployes",
  {
    taskEmploye_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    tasks_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        key: "task_id",
        model: tasksModel
      }
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        key: "user_id", 
        model: userModel
      }
    },
  },
  {
    timestamps: true, // Bu `createdAt` va `updatedAt` ustunlarini avtomatik yaratadi
  }
);

export default taskEmployesModel;
