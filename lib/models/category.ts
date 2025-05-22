import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["Men", "Women"], required: true },
  image: { type: String, required: true }, // Image for subcategories
});

export default models.Category || model("Category", CategorySchema);