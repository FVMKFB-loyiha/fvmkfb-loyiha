import setupModels from "./association.js";
import sequelize from "./sequelize.js";

async function connectToDb() {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("Successfully connected to database");
      await setupModels();

      await sequelize.sync({ logging: false, force: false });
      console.log("Database models synchronized successfully");
      return true;
    } catch (err) {
      retries++;
      console.error("Database connection error:", {
        attempt: retries,
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });

      if (retries === maxRetries) {
        console.error(
          "Maximum database connection retries reached. Exiting..."
        );
        throw new Error("Failed to connect to database after maximum retries");
      }

      console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

export default connectToDb;
