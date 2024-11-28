import { Sequelize } from "sequelize";
import getDotEnv from "../config/dotenv.config.js";

const dbName = getDotEnv("DATABASE_NAME");
const dbUser = getDotEnv("DATABASE_USER");
const dbPass = getDotEnv("DATABASE_PASSWORD")?.toString(); // Ensure password is a string
const dbHost = getDotEnv("DATABASE_HOST");
const dbPort = parseInt(getDotEnv("DATABASE_PORT"));

if (!dbName || !dbUser || !dbPass || !dbHost || !dbPort) {
  throw new Error("Missing required database configuration");
}

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
