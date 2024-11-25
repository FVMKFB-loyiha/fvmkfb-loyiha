import notificationModel from "../../model/core/notification/notification.model.js";
import {
  tasksModel,
  userModel,
  user_taskModel,
} from "../../model/core/index.js";

function setupModels() {
  userModel.belongsToMany(tasksModel, {
    through: user_taskModel,
    foreignKey: "user_id",
  });

  tasksModel.belongsToMany(userModel, {
    through: user_taskModel,
    foreignKey: "task_id",
  });

  userModel.hasMany(user_taskModel, { foreignKey: "user_id" });
  tasksModel.hasMany(user_taskModel, { foreignKey: "task_id" });

  user_taskModel.belongsTo(userModel, { foreignKey: "user_id" });
  user_taskModel.belongsTo(tasksModel, { foreignKey: "task_id" });

  userModel.hasMany(notificationModel, { foreignKey: "user_id" });
  notificationModel.belongsTo(userModel, { foreignKey: "user_id" });
}

export default setupModels;
