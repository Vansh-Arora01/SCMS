import mongoose from "mongoose";
import { College } from "../Models/College.model.js";
import dotenv from "dotenv";

dotenv.config();

const colleges = [
  { name: "CCSIt" },
  { name: "Nursing" },
  { name: "Law" },
  { name: "FOE" },
  { name: "Dental" },
];

const seedColleges = async () => {
  await mongoose.connect(process.env.DB_URL);

  for (const college of colleges) {
    const exists = await College.findOne({ name: college.name });
    if (!exists) {
      await College.create(college);
    }
  }

  console.log("✅ Colleges seeded");
  process.exit();
};

seedColleges();
