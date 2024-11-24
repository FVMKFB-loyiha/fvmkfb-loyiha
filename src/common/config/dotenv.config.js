import dotenv from "dotenv";
dotenv.config();

export default function getDotEnv(name) {
  return process.env[name];
}
