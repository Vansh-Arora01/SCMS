import fs from "fs";
import { Complaint } from "../Models/Complain.model.js";
import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import {ApiError} from "../Utils/apierror.js";
import { uploadToCloudinary } from "../Utils/cloudinary.js";

export const uploadComplaintMedia = asynchandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (String(complaint.collegeId) !== String(req.user.collegeId)) {
    throw new ApiError(403, "Access denied");
  }

  if (["RESOLVED", "REJECTED"].includes(complaint.status)) {
    throw new ApiError(400, "Cannot upload media to a closed complaint");
  }

  if (!req.file) {
    throw new ApiError(400, "No file provided");
  }

  let cloudResult;

  try {
    cloudResult = await uploadToCloudinary(
      req.file.path,
      `scms/complaints/${complaint._id}`
    );
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch {}
    throw new ApiError(500, "Cloud upload failed");
  }

  complaint.attachments.push({
    url: cloudResult.secure_url,
    fileType: req.file.mimetype.includes("pdf") ? "PDF" : "IMAGE"
  });

  await complaint.save();

  try {
    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error("Cleanup failed:", err.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      complaint.attachments,
      "Media uploaded successfully"
    )
  );
});
