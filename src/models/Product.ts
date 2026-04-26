import mongoose, { Schema, type InferSchemaType } from "mongoose";

const FlavourSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true }
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true, index: true },
    mrp: { type: Number, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    images: [{ type: String, required: true }],
    category: { type: String, required: true, index: true },
    rating: { type: Number, required: true, index: true },
    reviewCount: { type: Number, required: true },
    tags: [{ type: String, index: true }],
    goalTags: [{ type: String, index: true }],
    flavours: [FlavourSchema],
    badge: String,
    nutrition: [String],
    howToUse: { type: String, required: true },
    stock: { type: Number, required: true },
    featured: { type: Boolean, default: false },
    imageAccent: { type: String, required: true }
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text", goalTags: "text" });

export type ProductDocument = InferSchemaType<typeof ProductSchema>;

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
