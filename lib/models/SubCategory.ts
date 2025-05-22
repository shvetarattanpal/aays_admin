import mongoose, { Schema, model, models } from "mongoose";

const SubCategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    imageUrl: { type: String, required: true }, 
  });
  
  export default mongoose.models.SubCategory || mongoose.model("SubCategory", SubCategorySchema);  