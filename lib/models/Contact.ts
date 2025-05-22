import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ContactDocument extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<ContactDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = models.Contact || model<ContactDocument>("Contact", ContactSchema);
export default Contact;