import { Sequelize } from "sequelize";
import getDotEnv from "../config/dotenv.config.js";

const sequelize = new Sequelize(
  getDotEnv("DATABASE_NAME"),
  getDotEnv("DATABASE_USER"),
  getDotEnv("DATABASE_PASSWORD"),
  {
    host: getDotEnv("DATABASE_HOST"),
    dialect: "postgres",
    port: parseInt(getDotEnv("DATABASE_PORT")),
  }
);

export default sequelize;
