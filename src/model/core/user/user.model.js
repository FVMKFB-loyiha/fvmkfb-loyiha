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

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: ["admin", "xodim"],
    },

    tugilgan_sana: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    rasm: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    file: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bolim: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lavozim: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    talim_muassasasi: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    malumoti: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    talim_davri: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mutaxasisligi: {
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
