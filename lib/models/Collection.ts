import mongoose, { Schema, model, models } from "mongoose";

const CollectionSchema = new Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: [String], required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const Collection = models.Collection || model("Collection", CollectionSchema);

export default Collection;