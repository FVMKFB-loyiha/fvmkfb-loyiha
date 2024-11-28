import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";

const userModel = sequelize.define(
  "users",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM('admin', 'hodim'),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    picture: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },

  {
    timestamps: true, // Bu `createdAt` va `updatedAt` ustunlarini avtomatik yaratadi
  }
);

export default userModel;
