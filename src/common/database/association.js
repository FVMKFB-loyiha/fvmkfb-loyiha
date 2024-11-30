import notificationModel from "../../model/core/notification/notification.model.js";
import {
  tasksModel,
  userModel,
  user_taskModel,
} from "../../model/core/index.js";
import eduModel from "../../model/core/user/userEdu.model.js";
import taskEmployesModel from "../../model/core/task/taskEmployees.model.js";

function setupModels() {
  // Many-to-Many: userModel va tasksModel o'rtasida user_taskModel orqali aloqani o'rnatamiz
  userModel.belongsToMany(tasksModel, {
    through: user_taskModel, // user_taskModel: join jadvali
    foreignKey: "user_id", // user_id foreign key (userModel)
    otherKey: "task_id", // task_id foreign key (tasksModel)
  });

  // eduModel definition

  userModel.hasMany(eduModel, { foreignKey: "user_id" });
  eduModel.belongsTo(userModel, { foreignKey: "user_id" });

  tasksModel.belongsToMany(userModel, {
    through: user_taskModel, // user_taskModel: join jadvali
    foreignKey: "task_id", // task_id foreign key (tasksModel)
    otherKey: "user_id", // user_id foreign key (userModel)
  });

  tasksModel.belongsToMany(userModel, {
    through: taskEmployesModel, // user_taskModel: join jadvali
    foreignKey: "task_id", // task_id foreign key (tasksModel)
    otherKey: "user_id", // user_id foreign key (userModel)
  });

  // One-to-Many: userModel va user_taskModel o'rtasida bog'lanish
  userModel.hasMany(user_taskModel, { foreignKey: "user_id" });
  user_taskModel.belongsTo(userModel, { foreignKey: "user_id" });

  // One-to-Many: tasksModel va user_taskModel o'rtasida bog'lanish
  tasksModel.hasMany(user_taskModel, { foreignKey: "task_id" });
  user_taskModel.belongsTo(tasksModel, { foreignKey: "tasks_id" });

  // One-to-Many: userModel va notificationModel o'rtasida bog'lanish
  userModel.hasMany(notificationModel, { foreignKey: "user_id" });
  notificationModel.belongsTo(userModel, { foreignKey: "user_id" });
}

export default setupModels;
