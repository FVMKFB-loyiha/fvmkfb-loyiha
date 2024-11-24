import setupModels from "./association.js"
import sequelize from "./sequelize.js";

async function connectToDb() {
  try {
    await sequelize.authenticate();
    console.log("bazaga ulandi");
    await setupModels();

    await sequelize.sync();
    console.log("bazaga sinxron bo'ldi");
  } catch (err) {
    console.log("bazaga ulanishda xatolik bo'ldi"+err.message);
  }
}

export default connectToDb
