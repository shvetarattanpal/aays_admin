import mongoose, { Document, Schema, models, model } from "mongoose";

interface ProductItem {
  product: mongoose.Types.ObjectId;
  color: string;
  size: string;
  quantity: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDocument extends Document {
  orderId: string;
  customerClerkId: string;
  products: ProductItem[];
  shippingAddress: ShippingAddress;
  shippingRate: string;
  totalAmount: number;
  status: "Ordered" | "Shipped" | "Out for Delivery" | "Delivered";
  statusTimestamps: {
    ordered?: Date;
    shipped?: Date;
    outForDelivery?: Date;
    delivered?: Date;
  };
  createdAt: Date;
}

const orderSchema = new Schema<OrderDocument>({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  customerClerkId: { type: String, required: true },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      color: { type: String, required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  shippingRate: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Ordered", "Shipped", "Out for Delivery", "Delivered"],
    default: "Ordered",
  },
  statusTimestamps: {
    ordered: { type: Date, default: () => new Date() },
    shipped: Date,
    outForDelivery: Date,
    delivered: Date,
  },
  createdAt: { type: Date, default: () => new Date() },
});

const Order = models.Order || model<OrderDocument>("Order", orderSchema);

export default Order;