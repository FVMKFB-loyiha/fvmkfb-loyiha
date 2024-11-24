import setupModels from "./association.js";
import sequelize from "./sequelize.js";

async function connectToDb() {
  try {
    await sequelize.authenticate();
    console.log("connected to database");
    await setupModels();

    await sequelize.sync();
    console.log("synced to the base");
  } catch (err) {
    console.log("there was an error connecting to the database" + err.message);
  }
}

export default connectToDb;
