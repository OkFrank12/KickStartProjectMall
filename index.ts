import express from "express";
import { Application } from "express-serve-static-core";
import { envVariables } from "./config/envVariables";
import { mainApp } from "./mainApp";

const port: number = parseInt(envVariables.PORT);

const app: Application = express();
mainApp(app);

const server = app.listen(process.env.PORT || port, () => {
  console.log("Server is listening");
});

server.on("uncaughtException", (error: any) => {
  console.log("uncaughtException: ", error);
  process.exit(1);
});

server.on("unhandledRejection", (reason: any) => {
  console.log("unhandledRejection: ", reason);
  server.close(() => {
    process.exit(1);
  });
});
