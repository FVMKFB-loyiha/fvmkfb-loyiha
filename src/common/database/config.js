import pkg from 'pg';
const { Client } = pkg;
import getDotEnv from "../config/dotenv.config.js";

export const client = new Client({
    user: getDotEnv("DATABASE_USER"),
    host: getDotEnv("DATABASE_HOST"),
    database: getDotEnv("DATABASE_NAME"),
    password: getDotEnv("DATABASE_PASSWORD"),
    port: parseInt(getDotEnv("DATABASE_PORT")),
  });
