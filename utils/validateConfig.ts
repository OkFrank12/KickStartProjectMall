import joi from "joi";
import { Request, Response, NextFunction } from "express";

export default (Schema: joi.ObjectSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = Schema.validate(req.body);
    if (error) {
      return res.status(404).json({
        message: "Validation Error",
        data: error,
      });
    } else {
      next();
    }
  };
};
