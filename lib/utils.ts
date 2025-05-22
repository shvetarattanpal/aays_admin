import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProductType } from "@/lib/types";
import { Document } from "mongoose";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mapToProductType = (product: any): ProductType => ({
  _id: product._id.toString(),
  title: product.title,
  description: product.description,
  media: product.media,
  imageUrl: product.imageUrl,
  category: product.category,
  subCategory: product.subCategory,
  collections: product.collections,
  tags: product.tags,
  price: product.price,
  expense: product.expense,
  sizes: product.sizes,
  colors: product.colors,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const serializeMongooseDocument = (doc: Document) => {
  const plain = JSON.parse(JSON.stringify(doc));
  if (plain._id && typeof plain._id === "object") {
    plain._id = plain._id.toString();
  }
  return plain;
};

export const serializeMongooseDocuments = (docs: Document[]) => {
  return docs.map(serializeMongooseDocument);
};