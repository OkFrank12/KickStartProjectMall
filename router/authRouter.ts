import express from "express";
import {
  RegisterAdminUser,
  RegisterDispatchUser,
  RegisterUser,
  changeAccountPassword,
  deleteUser,
  resetUserPassword,
  signInUser,
  updateAccountAvatar,
  updateAccountInfo,
  verifyUser,
  viewAllUser,
  viewOneUser,
} from "../controller/authController";
import validateConfig from "../utils/validateConfig";
import {
  createAdminAccountValidator,
  createChangeAccountPasswordValidator,
  createRegisterAccountValidator,
  createResetAccountPasswordValidator,
  createSignInAccountValidator,
} from "../utils/validation";
import multer from "multer";

const uploader = multer().single("avatar");

const authRouter = express.Router();

authRouter
  .route("/register")
  .post(validateConfig(createRegisterAccountValidator), RegisterUser);
authRouter.route("/:token/verify-account").get(verifyUser);
authRouter.route("/all").get(viewAllUser);
authRouter.route("/:accountID/one").get(viewOneUser);
authRouter.route("/:accountID/delete").delete(deleteUser);
authRouter
  .route("/sign-in")
  .post(validateConfig(createSignInAccountValidator), signInUser);
authRouter
  .route("/reset-account-password")
  .patch(
    validateConfig(createResetAccountPasswordValidator),
    resetUserPassword
  );
authRouter
  .route("/:token/change-account-password")
  .patch(
    validateConfig(createChangeAccountPasswordValidator),
    changeAccountPassword
  );

authRouter.route("/:accountID/update-info").patch(updateAccountInfo);
authRouter
  .route("/:accountID/update-avatar")
  .patch(uploader, updateAccountAvatar);
authRouter
  .route("/register-admin")
  .post(validateConfig(createAdminAccountValidator), RegisterAdminUser);
authRouter
  .route("/register-rider")
  .post(validateConfig(createRegisterAccountValidator), RegisterDispatchUser);

export default authRouter;
