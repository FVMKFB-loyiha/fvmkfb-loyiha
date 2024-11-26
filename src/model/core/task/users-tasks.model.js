import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize";

const taskAssignments = sequelize.define("taskAssignments", {
    task_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "tasks", // tasks modeliga bog'lanadi
        key: "tasks_id", // tasks jadvalidagi primary key
      },
      allowNull: false,
    },
  
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users", // users modeliga bog'lanadi
        key: "user_id", // users jadvalidagi primary key
      },
      allowNull: false,
    },
  });
  
  export default taskAssignments;
  