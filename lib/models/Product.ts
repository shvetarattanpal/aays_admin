import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  media: string[];
  imageUrl: string;
  category: string;
  subCategory: string;
  collections: mongoose.Types.ObjectId[];
  tags: string[];
  sizes: string[];
  colors: string[];
  price: number;
  expense: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    media: { type: [String], required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    tags: { type: [String], required: true },
    sizes: { type: [String], required: true },
    colors: { type: [String], required: true },
    price: { type: Number, required: true },
    expense: { type: Number, required: true },
  },
  { timestamps: true }
);

ProductSchema.statics.findSerialized = async function () {
  const products = await this.find();
  return products.map((doc: Document) =>
    doc.toObject({
      transform: (_, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    })
  );
};

const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;