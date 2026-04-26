import mongoose, { Schema, type InferSchemaType } from "mongoose";

const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const OrderLineSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    address: { type: AddressSchema, required: true },
    items: [OrderLineSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, required: true, index: true },
    paymentMode: { type: String, required: true },
    estimatedDelivery: { type: String, required: true }
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof OrderSchema>;

export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
