import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  products: Array<{
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    name?: string; // optional, since it's sent from frontend
  }>;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  transactionId?: string; // optional since it's not always available
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        name: {
          type: String, // optional but useful to save for display
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      required: false, // made optional
    },
    paymentMethod: {
      type: String,
      enum: ["Cash On Delivery", "ONLINE PAYMENT"],
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 120,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
