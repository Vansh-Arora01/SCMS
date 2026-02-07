// src/Models/College.model.js
import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

export const College = mongoose.model("College", collegeSchema);
