import "../config/env.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim:true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      uppercase:true,
      
      enum: ["STUDENT", "ADMIN", "SUPER_ADMIN", "STAFF"],
      default: "STUDENT",
    },
    department: {
      type: String,
      // enum: ["plumbing", "electricity", "network", "cleaning"],
      required: function () {
        return this.role === "STAFF";
      },
    },

    college: {
      type: String,
      required: true,
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    enrollment: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

//   console.log("ACCESS_SECRET =", process.env.ACCESS_SECRET);
// console.log("ACCESS_EXPIRY =", process.env.ACCESS_EXPIRY);
// console.log("REFRESH_SECRET =", process.env.REFRESH_SECRET);
// console.log("REFRESH_EXPIRY =", process.env.REFRESH_EXPIRY);
// userSchema.pre("save", async function () {
//   //hash password before saving to db
//   if (!this.isModified("password")) return next()
//   this.password = await bcrypt.hash(this.password, 10);

// });
userSchema.pre("save", async function () {
  // hash password before saving to DB
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      college: this.college,
      name: this.name,
      email: this.email,
      collegeId: this.collegeId,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "7d" },
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};

// generation of token without data
userSchema.methods.generateTemporaryToken = function () {
  const unhashedToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 10 * 60 * 1000; //10 minutes

  return { unhashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
