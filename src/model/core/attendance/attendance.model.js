import sequelize from "../../../common/database/sequelize.js";
import userModel from "../user/user.model.js";
import { DataTypes } from "sequelize";

const attendanceModel = sequelize.define(
  "attendance",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("keldi", "kelmadi", "kech qoldi"),
      allowNull: false,
      validate: {
        isIn: [["keldi", "kelmadi", "kech qoldi"]],
      },
    },
  },
  { timestamps: false }
);

attendanceModel.belongsTo(userModel, {
  foreignKey: "userId",
  targetKey: "id",
  as: "user",
});

export default attendanceModel;
