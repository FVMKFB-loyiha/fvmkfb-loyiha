import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize.js";

const FamilyMember = sequelize.define("family_member", {
  family_member: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birth_data: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_address: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Kiritilmagan",
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Kiritilmagan",
  },
});

export default FamilyMember;
