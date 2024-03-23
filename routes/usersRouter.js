import express from "express";
import {
  registerUser,
  verifyEmailUser,
  repeatVerifyEmailUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscriptionUser,
  updateAvatarUser,
} from "../controllers/usersControllers.js";
import { validateBody } from "../middlewares/validateBody.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/upload.js";
import {
  registerSchema,
  emailVerificationSchema,
  loginSchema,
  updateSubscriptionUserSchema,
} from "../models/usersModel.js";

export const usersRouter = express.Router();

// sign up

usersRouter.post("/register", validateBody(registerSchema), registerUser);

usersRouter.get("/verify/:verificationToken", verifyEmailUser);

usersRouter.post(
  "/verify",
  validateBody(emailVerificationSchema),
  repeatVerifyEmailUser
);

// sign in

usersRouter.post("/login", validateBody(loginSchema), loginUser);

usersRouter.post("/logout", authenticate, logoutUser);

usersRouter.get("/current", authenticate, getCurrentUser);

// subscription

usersRouter.patch(
  "/",
  authenticate,
  validateBody(updateSubscriptionUserSchema),
  updateSubscriptionUser
);

//avatar

usersRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  updateAvatarUser
);
