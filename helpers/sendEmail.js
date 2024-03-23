import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const { MAILTRAP_PASSWORD } = process.env;
const { MAILTRAP_USER } = process.env;

const nodemailerConfig = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASSWORD,
  },
};

export const sendEmail = async (data) => {
  const transport = nodemailer.createTransport(nodemailerConfig);
  const email = {
    ...data,
    from: "oleg-fs@meta.ua",
  };

  transport
    .sendMail(email)
    .then(() => console.log("Email send success"))
    .catch((error) => console.log(error.message));
};
