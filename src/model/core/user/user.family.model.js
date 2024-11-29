import { DataTypes } from "sequelize";
import sequelize from "../../../common/database/sequelize";

const FamilyMember = sequelize.define("FamilyMember", {
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
