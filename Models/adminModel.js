import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


const adminModel =mongoose.model("Admin", AdminSchema);
export default adminModel