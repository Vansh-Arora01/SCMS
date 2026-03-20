// src/Controllers/college.controller.js
import { College } from "../Models/College.model.js";
import { ApiError } from "../Utils/apierror.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import { asynchandler } from "../Utils/asyncHandler.js";

export const createCollege = asynchandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "College name is required");
  }

  const existing = await College.findOne({ name });
  if (existing) {
    throw new ApiError(400, "College already exists");
  }

  const college = await College.create({ name });

  return res.status(201).json(
    new ApiResponse(201, college, "College created successfully")
  );
});

export const getColleges = asynchandler(async (req, res) => {

  const colleges = await College.find().sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, colleges, "Colleges fetched successfully")
  );

});