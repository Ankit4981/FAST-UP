import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    image: String
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
