import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";
import userModel from "../user/user.model.js";

const notificationModel = sequelize.define("notifications", {
  notification_id: {
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

  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("unread", "read"),
    defaultValue: "unread",
  },
});

export default notificationModel;
