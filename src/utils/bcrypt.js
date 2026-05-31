import "dotenv/config";
import bcrypt from "bcrypt";

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(process.env.SALT) || 10));

export const validatePassword = (passwordSend, passwordBDD) =>
  bcrypt.compareSync(passwordSend, passwordBDD);
