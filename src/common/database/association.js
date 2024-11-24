import notificationModel from "../../model/core/notification/notification.model.js";
import tasksModel from "../../model/core/task/task.model.js";
import userModel from "../../model/core/user/user.model.js";
import user_taskModel from "../../model/core/user_task/user_task.model.js";

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