import joi from "joi";

let regex =
  /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).{10,16}$/;

export const createRegisterAccountValidator = joi.object({
  userName: joi.string().required(),
  email: joi.string().email().trim().lowercase().required(),
  password: joi.string().pattern(new RegExp(regex)).required(),
  confirm: joi.ref("password"),
});

export const createAdminAccountValidator = joi.object({
  userName: joi.string().required(),
  email: joi.string().email().trim().lowercase().required(),
  password: joi.string().pattern(new RegExp(regex)).required(),
  confirm: joi.ref("password"),
  adminSecret: joi.string().required(),
});

export const createSignInAccountValidator = joi.object({
  email: joi.string().email().trim().lowercase().required(),
  password: joi.string().pattern(new RegExp(regex)).required(),
});

export const createResetAccountPasswordValidator = joi.object({
  email: joi.string().email().trim().lowercase().required(),
});

export const createChangeAccountPasswordValidator = joi.object({
  password: joi.string().pattern(new RegExp(regex)).required(),
});
