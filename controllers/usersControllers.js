import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

import { UsersModel } from "../models/usersModel.js";
import { HttpError } from "../helpers/HttpError.js";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { getDir } from "../helpers/getDir.js";
import { resizeAvatar } from "../helpers/resizeAvatar.js";
import { sendEmail } from "../helpers/sendEmail.js";

dotenv.config();

const { SECRET_KEY, BASE_URL } = process.env;

const avatarDir = getDir("../public/avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const registeredEmail = await UsersModel.findOne({ email });
  if (registeredEmail) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await UsersModel.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const emailData = {
    to: email,
    subject: "please verify your email to complete the registration",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click to verify your email</a>`,
  };

  await sendEmail(emailData);

  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await UsersModel.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await UsersModel.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  res.json({ message: "Verification successful" });
};

const repeatVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await UsersModel.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email is wrong");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const emailData = {
    to: email,
    subject: "please verify your email to complete the registration",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click to verify your email</a>`,
  };
  await sendEmail(emailData);

  res.json({ message: "Verification email sent" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await UsersModel.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!user.verify) {
    throw HttpError(401, "Email is not verified");
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
export const verifyEmailUser = ctrlWrapper(verifyEmail);
export const repeatVerifyEmailUser = ctrlWrapper(repeatVerifyEmail);
export const loginUser = ctrlWrapper(login);
export const logoutUser = ctrlWrapper(logout);
export const getCurrentUser = ctrlWrapper(getCurrent);
export const updateSubscriptionUser = ctrlWrapper(updateSubscription);
export const updateAvatarUser = ctrlWrapper(updateAvatar);
