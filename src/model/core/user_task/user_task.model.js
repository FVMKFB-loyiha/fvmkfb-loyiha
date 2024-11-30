import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";
import userModel from "../user/user.model.js";
import tasksModel from "../task/task.model.js";

const userTaskModel = sequelize.define("user_tasks", {
  userTask_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      key: "user_id",
      model: userModel,
    },
  },

  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      key: "tasks_id",
      model: tasksModel,
    },
  },
});

export default userTaskModel;
