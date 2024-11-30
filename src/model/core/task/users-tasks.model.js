// import { DataTypes } from "sequelize";
// import sequelize from "../../../common/database/sequelize.js";
// import tasksModel from "./task.model";
// import userModel from "../user/user.model";

// const taskAssignments = sequelize.define("taskAssignments", {
//     task_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: tasksModel, // tasks modeliga bog'lanadi
//         key: "tasks_id", // tasks jadvalidagi primary key
//       },
//       allowNull: false,
//     },
  
//     user_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: userModel, // users modeliga bog'lanadi
//         key: "user_id", // users jadvalidagi primary key
//       },
//       allowNull: false,
//     },
//   });
  
//   export default taskAssignments;
  