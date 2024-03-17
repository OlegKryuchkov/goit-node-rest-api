import { ContactsModel } from "../models/contactsModel.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";

const getAllContacts = async (req, res) => {
  const contactsList = await ContactsModel.find();
  res.json(contactsList);
};

const getOneContact = async (req, res) => {
  const { id } = req.params;
  const searchedContact = await ContactsModel.findById(id);
  if (!searchedContact) {
    throw HttpError(404);
  }
  res.json(searchedContact);
};

const createContact = async (req, res) => {
  const newContact = await ContactsModel.create(req.body);
  res.status(201).json(newContact);
};

const updateContact = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "Body must have at least one field");
  }
  const { id } = req.params;
  const updatedContact = await ContactsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedContact) {
    throw HttpError(404);
  }
  res.json(updatedContact);
};

const updateStatusContact = async (req, res) => {
  const { id } = req.params;
  const updatedContactStatus = await ContactsModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  );
  if (!updatedContactStatus) {
    throw HttpError(404);
  }
  res.json(updatedContactStatus);
};

const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  const removedContact = await ContactsModel.findByIdAndDelete(id);
  if (!removedContact) {
    throw HttpError(404);
  }
  res.json(removedContact);
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteContact: ctrlWrapper(deleteContact),
};
