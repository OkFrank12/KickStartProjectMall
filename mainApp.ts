import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./router/authRouter";

export const mainApp = (app: Application) => {
  app.use(cors());
  app.use(express.json());

  app.use(helmet());
  app.use(morgan("dev"));

  app.use("/api", authRouter);
  app.get("/", (req: Request, res: Response) => {
    try {
      return res.status(200).json({
        message: "success on Default GET",
      });
    } catch (error) {
      return res.status(404).json({
        message: "error on Default GET",
        data: error,
      });
    }
  });
};
