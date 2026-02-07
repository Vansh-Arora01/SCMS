import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import {ApiError} from "../../Utils/apierror.js";
import { Complaint } from "../../Models/Complain.model.js";
import { User } from "../../Models/User.model.js";


export const createStaff = asynchandler(async (req, res) => {
  const { name, email, password, enrollment } = req.body;

  const staff = await User.create({
    name,
    email,
    password,
    role: "STAFF",
    collegeId: req.user.collegeId,
    enrollment
  });

  res.status(201).json(
    new ApiResponse(201, staff, "Staff created successfully")
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
