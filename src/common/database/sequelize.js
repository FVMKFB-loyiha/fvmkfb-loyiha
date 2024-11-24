import { Sequelize } from "sequelize";
import getConfig from "../config/config.service.js";

const sequelize = new Sequelize(
  getConfig("DATABASE_NAME"),
  getConfig("DATABASE_USER"),
  getConfig("DATABASE_PASSWORD"),
  {
    host: getConfig("DATABASE_HOST"),
    dialect: "postgres",
    port: parseInt(getConfig("DATABASE_PORT")),
  }
);

export default sequelize;
