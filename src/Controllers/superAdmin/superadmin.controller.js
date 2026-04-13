import { asynchandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/apiresponse.js";
import { ApiError } from "../../Utils/apierror.js";
import { User } from "../../Models/User.model.js";
import { Complaint } from "../../Models/Complain.model.js";


// 🔥 CREATE ADMIN
export const createAdmin = asynchandler(async (req, res) => {
  const { name, email, password, enrollment, collegeId, college } = req.body;

  // 🔐 Only SUPER ADMIN allowed
  if (req.user.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Only Super Admin can create admin");
  }

  // 🔎 Prevent duplicates
  const existing = await User.findOne({
    $or: [{ email }, { enrollment }]
  });

  if (existing) {
    throw new ApiError(400, "Admin already exists with email or enrollment");
  }

  const admin = await User.create({
    name,
    email,
    password,
    enrollment,
    role: "ADMIN",   //  MAIN CHANGE
    collegeId,       // from frontend as college me dena pdega idhar 
    college          // id aa gyi to college fetch kr lrnge
  });

  
  const createdAdmin = await User.findById(admin._id).select("-password");

  res.status(201).json(
    new ApiResponse(201, createdAdmin, "Admin created successfully")
  );
});
export const deleteAdmin = asynchandler(async (req, res) => {
  const admin = await User.findById(req.params.id);

  if (!admin || admin.role !== "ADMIN") {
    throw new ApiError(404, "Admin not found");
  }

  
  const activeComplaints = await Complaint.countDocuments({
    collegeId: admin.collegeId,
    status: { $nin: ["RESOLVED", "REJECTED"] }
  });

  if (activeComplaints > 0) {
    throw new ApiError(
      400,
      "College has active complaints. Resolve before deleting admin."
    );
  }

  await admin.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Admin deleted successfully")
  );
});
export const getAllAdmins = asynchandler(async (req, res) => {

  
  if (req.user.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Only Super Admin can access admins");
  }

  const { collegeId } = req.query;

  const filter = { role: "ADMIN" };

  // 🔥 If collegeId passed → filter
  if (collegeId) {
    filter.collegeId = collegeId;
  }

  const admins = await User.find(filter)
    .select("-password")
    .populate("collegeId", "name code");

  res.status(200).json(
    new ApiResponse(200, admins, "Admins fetched successfully")
  );
});

export const getSuperAdminProfile = asynchandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Super Admin only");
  }

  res.status(200).json(
    new ApiResponse(200, {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      collegeId: req.user.collegeId,
      createdAt: req.user.createdAt
    }, "Super Admin profile fetched successfully")
  );
});