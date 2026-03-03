import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import {ApiError} from "../../Utils/apierror.js";
import { Complaint } from "../../Models/Complain.model.js";
import { User } from "../../Models/User.model.js";


export const createStaff = asynchandler(async (req, res) => {
  const { name, email, password, enrollment, department } = req.body;

  // 🔐 Only admin allowed
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can create staff");
  }

  // 🔎 Prevent duplicates
  const existing = await User.findOne({
    $or: [{ email }, { enrollment }]
  });

  if (existing) {
    throw new ApiError(400, "Staff already exists with email or enrollment");
  }

  const staff = await User.create({
    name,
    email,
    password,
    role: "STAFF",
    department,
    collegeId: req.user.collegeId,
    college : req.user.college,
    enrollment
  });

  // Remove password from response
  const createdStaff = await User.findById(staff._id).select("-password");

  res.status(201).json(
    new ApiResponse(201, createdStaff, "Staff created successfully")
  );
});


export const deleteStaff = asynchandler(async (req, res) => {
  const staff = await User.findById(req.params.id);

  if (!staff || staff.role !== "STAFF") {
    throw new ApiError(404, "Staff not found");
  }

  const activeComplaints = await Complaint.countDocuments({
    assignedTo: staff._id,
    status: { $nin: ["RESOLVED", "REJECTED"] }
  });

  if (activeComplaints > 0) {
    throw new ApiError(
      400,
      "Staff has active complaints. Reassign before deletion."
    );
  }

  await staff.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Staff deleted successfully")
  );
});

export const getAllStaff = asynchandler(async (req, res) => {
  const staff = await User.find({ role: "STAFF" }).select("-password");

  res.status(200).json({
    success: true,
    data: staff,
  });
});

// admin profile isse me add kr rha ho 
export const getAdminProfile = asynchandler(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Admins only");
  }

  res.status(200).json(
    new ApiResponse(200, {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      collegeId: req.user.collegeId,
      createdAt: req.user.createdAt
    }, "Admin profile fetched successfully")
  );
});
