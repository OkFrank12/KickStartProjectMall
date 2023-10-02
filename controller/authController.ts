import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { role } from "../config/role";
import {
  sendAccountOpeningMail,
  sendResetAccountPasswordMail,
} from "../utils/email";
import { streamUpload } from "../utils/steamUpload";

const prisma = new PrismaClient();

export const RegisterUser = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    const salted = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salted);
    const value = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign(value, "token");

    const account = await prisma.authModel.create({
      data: {
        userName,
        email,
        password: hashed,
        token,
        role: role.USER,
      },
    });

    const tokenID = jwt.sign({ id: account.id }, "token");
    sendAccountOpeningMail(account, tokenID).then(() => {
      console.log("Mail sent!!!");
    });

    return res.status(404).json({
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error registering user",
      data: error,
    });
  }
};

export const RegisterDispatchUser = async (req: Request, res: Response) => {
  try {
    const { userName, email, password, dispatchID } = req.body;
    const salted = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salted);
    const value = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign(value, "token");

    const searchData = [
      {
        id: 1,
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
      {
        id: 4,
      },
    ];

    const findDispatchID = searchData.some((el: any) => el.id === dispatchID);
    if (findDispatchID) {
      const dispatch = await prisma.authModel.create({
        data: {
          userName,
          email,
          password: hashed,
          token,
          role: role.DISPATCHER,
        },
      });

      const tokenID = jwt.sign({ id: dispatch.id }, "token");
      sendAccountOpeningMail(dispatch, tokenID).then(() => {
        console.log("Dispatch Mail sent");
      });

      return res.status(201).json({
        message: "Register Dispatch Rider",
        data: dispatch,
      });
    } else {
      return res.status(404).json({
        message: "Please check your dispatch ID",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error registering dispatcher",
      data: error,
    });
  }
};

export const RegisterAdminUser = async (req: Request, res: Response) => {
  try {
    const { userName, email, password, adminSecret } = req.body;
    const salted = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salted);
    const value = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign(value, "token");

    if (adminSecret === "code") {
      const admin = await prisma.authModel.create({
        data: {
          userName,
          email,
          password: hashed,
          token,
          role: role.ADMIN,
        },
      });

      const tokenID = jwt.sign({ id: admin.id }, "token");
      sendAccountOpeningMail(admin, tokenID).then(() => {
        console.log("Admin Mail sent!!!");
      });

      return res.status(201).json({
        message: "Admin Account created",
        data: admin,
      });
    } else {
      return res.status(404).json({
        message: "Admin secret does not correspond",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error registering admin user",
      data: error,
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const getId: any = jwt.verify(token, "token", (err: any, payload: any) => {
      if (err) {
        return err;
      } else {
        return payload;
      }
    });

    const account = await prisma.authModel.update({
      where: { id: getId.id },
      data: {
        verified: true,
        token: "",
      },
    });

    return res.status(200).json({
      message: "Account Verified",
      data: account,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error verifying user",
      data: error,
    });
  }
};

export const viewAllUser = async (req: Request, res: Response) => {
  try {
    const all = await prisma.authModel.findMany({});
    if (all.length > 0) {
      return res.status(200).json({
        message: "viewing all users",
        data: all,
      });
    } else {
      return res.status(404).json({
        message: "empty database",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error viewing all users",
      data: error,
    });
  }
};

export const viewOneUser = async (req: Request, res: Response) => {
  try {
    const { accountID } = req.params;
    const one = await prisma.authModel.findUnique({
      where: { id: accountID },
    });

    return res.status(200).json({
      message: "viewing one account",
      data: one,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error viewing one user",
      data: error,
    });
  }
};

export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const account = await prisma.authModel.findUnique({
      where: { email },
    });
    if (account) {
      const checkPassword = await bcrypt.compare(password, account.password);
      if (checkPassword) {
        if (account.verified && account.token === "") {
          const token = jwt.sign({ id: account.id }, "token");
          return res.status(201).json({
            message: `Welcome back ${account.userName}`,
            data: token,
          });
        } else {
          return res.status(404).json({
            message: "Please go and verify",
          });
        }
      } else {
        return res.status(404).json({
          message: "Password is not correct",
        });
      }
    } else {
      return res.status(404).json({
        message: "email is not registered",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error signing in user",
      data: error,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { accountID } = req.params;
    await prisma.authModel.delete({
      where: { id: accountID },
    });

    return res.status(201).json({
      message: "Deleted User",
    });
  } catch (error) {
    return res.status(404).json({
      message: "error deleting user",
      data: error,
    });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const account = await prisma.authModel.findUnique({
      where: { email },
    });

    if (account?.verified && account.token === "") {
      const token = jwt.sign({ id: account.id }, "token");
      await prisma.authModel.update({
        where: { id: account.id },
        data: {
          token,
        },
      });
      sendResetAccountPasswordMail(account, token).then(() => {
        console.log("Reset Mail sent!!!");
      });

      return res.status(201).json({
        message: "You can now change your password",
        data: token,
      });
    } else {
      return res.status(404).json({
        message: "Can't reset this password",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error reseting password",
      data: error,
    });
  }
};

export const changeAccountPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const getID: any = jwt.verify(token, "token", (err: any, payload: any) => {
      if (err) {
        return err;
      } else {
        return payload;
      }
    });

    console.log(getID);

    const account = await prisma.authModel.findUnique({
      where: { id: getID.id },
    });

    if (account?.verified && account.token !== "") {
      const salted = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salted);

      await prisma.authModel.update({
        where: { id: account.id },
        data: {
          password: hashed,
        },
      });

      return res.status(201).json({
        message: "Your password has been changed",
      });
    } else {
      return res.status(404).json({
        message: "You can't reset this password",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error changing account password",
      data: error,
    });
  }
};

export const updateAccountInfo = async (req: Request, res: Response) => {
  try {
    const { userName } = req.body;
    const { accountID } = req.params;

    const user = await prisma.authModel.update({
      where: { id: accountID },
      data: {
        userName,
      },
    });

    return res.status(404).json({
      message: "Update Account Info",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error updating account information",
      data: error,
    });
  }
};

export const updateAccountAvatar = async (req: Request, res: Response) => {
  try {
    const { accountID } = req.params;

    const { secure_url, public_id }: any = await streamUpload(req);

    const account = await prisma.authModel.update({
      where: { id: accountID },
      data: {
        avatar: secure_url,
        avatarID: public_id,
      },
    });

    return res.status(201).json({
      message: "Account Avatar updated",
      data: account,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error updating account avatar",
      data: error,
    });
  }
};
