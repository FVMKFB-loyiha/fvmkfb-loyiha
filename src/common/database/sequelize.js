import { Sequelize } from "sequelize";
import getDotEnv from "../config/dotenv.config.js";
import chalk from "chalk";

const sequelize = new Sequelize({
  database: getDotEnv("DATABASE_NAME"),
  username: getDotEnv("DATABASE_USER"),
  password: getDotEnv("DATABASE_PASSWORD"),
  host: getDotEnv("DATABASE_HOST"),
  dialect: "postgres",
  port: parseInt(getDotEnv("DATABASE_PORT")),
});

// Ma'lumotlar bazasi ulanishini tekshirish va chiroyli console.log
sequelize
  .authenticate()
  .then(() => {
    console.log(
      chalk.bgGreen.black(` ✓ DATABASE `) +
        chalk.green(` Muvaffaqiyatli ulandi! `) +
        chalk.gray(
          `[${getDotEnv("DATABASE_NAME")}@${getDotEnv(
            "DATABASE_HOST"
          )}:${getDotEnv("DATABASE_PORT")}]`
        )
    );
  })
  .catch((err) => {
    console.error(
      chalk.bgRed.white(` ✕ DATABASE `) +
        chalk.red(` Ulanish xatosi: `) +
        chalk.yellow(err.message)
    );
  });

export default sequelize;
