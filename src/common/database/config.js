export const client = new Client({
    user: getDotEnv("DATABASE_USER"),
    host: getDotEnv("DATABASE_HOST"),
    database: getDotEnv("DATABASE_NAME"),
    password: getDotEnv("DATABASE_PASSWORD"),
    port: parseInt(getDotEnv("DATABASE_PORT")),
  });