import express from "express";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";
import { updateComplaintStatusValidator } from "../Validators/complaint.validator.js";

import {getAssignedComplaints,
    getAssignedComplaintById,
    updateAssignedComplaintStatus,
    getStaffProfile,
  requestReassignment} from "../Controllers/staff/staff.complaint.controller.js"


const router = express.Router();


router.get(
  "/assigned",
 verifyJWT,
  allowRoles("STAFF"),
  getAssignedComplaints
);

router.get(
  "/assigned/:id",
  verifyJWT,
  allowRoles("STAFF"),
  getAssignedComplaintById
);

router.patch(
  "/:id/status",
  verifyJWT,
  allowRoles("STAFF"),
  updateComplaintStatusValidator, //  used ab
  updateAssignedComplaintStatus
);


router.get(
  "/profile",
 verifyJWT,
  allowRoles("STAFF"),
  getStaffProfile
);




// tries one optional one 

// Staff requests admin to reassign a complaint
router.patch(
  "/:id/request-reassignment",
   verifyJWT,
  allowRoles("STAFF"),
  requestReassignment
);

export default router;