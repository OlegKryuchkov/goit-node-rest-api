import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";

import { UsersModel } from "../models/usersModel.js";
import { HttpError } from "../helpers/HttpError.js";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { getDir } from "../helpers/getDir.js";
import { resizeAvatar } from "../helpers/resizeAvatar.js";

dotenv.config();

const { SECRET_KEY } = process.env;

const avatarDir = getDir("../public/avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const registeredEmail = await UsersModel.findOne({ email });
  if (registeredEmail) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await UsersModel.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });
  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await UsersModel.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await UsersModel.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await UsersModel.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id, email } = req.user;
  await UsersModel.findByIdAndUpdate(_id, { subscription });
  res.json({ user: { email, subscription: subscription } });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);

  await resizeAvatar(tempUpload);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await UsersModel.findByIdAndUpdate(_id, { avatarURL });
  res.json({ avatarURL });
};

export const registerUser = ctrlWrapper(register);
export const loginUser = ctrlWrapper(login);
export const logoutUser = ctrlWrapper(logout);
export const getCurrentUser = ctrlWrapper(getCurrent);
export const updateSubscriptionUser = ctrlWrapper(updateSubscription);
export const updateAvatarUser = ctrlWrapper(updateAvatar);
