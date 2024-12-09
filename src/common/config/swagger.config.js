import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import getDotEnv from "./dotenv.config.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = getDotEnv("EXPRESS_PORT");
const swaggerPaths = join(__dirname, "../../swagger/paths/*.js");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FVMKFB API",
      version: "1.0.0",
      description: "FVMKFB RESTFUL API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token kiriting. Misol: Bearer eyJhbGc...",
        },
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [swaggerPaths],
};

const swaggerDoc = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDoc };
