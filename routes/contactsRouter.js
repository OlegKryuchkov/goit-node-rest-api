import express from "express";
import {
  getAllContacts,
  getOneContact,
  createContact,
  updateContact,
  updateStatusContact,
  deleteContact,
} from "../controllers/contactsControllers.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from "../models/contactsModel.js";

export const contactsRouter = express.Router();

contactsRouter.get("/", authenticate, getAllContacts);

contactsRouter.get("/:id", authenticate, isValidId, getOneContact);

contactsRouter.post(
  "/",
  authenticate,
  validateBody(createContactSchema),
  createContact
);

contactsRouter.put(
  "/:id",
  authenticate,
  isValidId,
  validateBody(updateContactSchema),
  updateContact
);

contactsRouter.patch(
  "/:id/favorite",
  authenticate,
  isValidId,
  validateBody(updateStatusContactSchema),
  updateStatusContact
);

contactsRouter.delete("/:id", authenticate, isValidId, deleteContact);
