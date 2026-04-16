import express from "express";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";
import {getUnassignedComplaints,assignComplaint,reassignComplaint,getComplaintsSortedByDepartment,getComplaintsCategoryWise,handleReassignmentRequest,getReassignmentRequests} from "../Controllers/admin/admin.complaint.controller.js"
import {createStaff,deleteStaff,getAdminProfile,getAllStaff,updateStaff} from "../Controllers/admin/admin.staff.controller.js"
import { getAdminDashboardStats } from "../Controllers/admin/dashboard.controller.js";

const router = express.Router();


//complain routes

router.get(
  "/unassigned",
 verifyJWT,
  allowRoles("ADMIN"),
  getUnassignedComplaints
);

router.patch(
  "/assign/:id",
  verifyJWT,
  allowRoles("ADMIN"),
  assignComplaint
);
router.put(
  "/reassignment/:id",
  verifyJWT,
  handleReassignmentRequest
);

router.get(
  "/reassignment-requests",
  verifyJWT,
  allowRoles("ADMIN"),
  getReassignmentRequests
);

router.patch(
  "/reassign/:id",
 verifyJWT,
  allowRoles("ADMIN"),
  reassignComplaint
);


// staff routes 


router.post(
  "/createStaff",
 verifyJWT,
  allowRoles("ADMIN"),
  createStaff
);

router.delete(
  "/:id",
 verifyJWT,
  allowRoles("ADMIN"),
  deleteStaff
);
router.put("/update/:id", updateStaff);

router.get(
  "/all-staff",
 verifyJWT,
  allowRoles("ADMIN"),
  getAllStaff
)
// admin profile vala isse me staff se liya ha 
router.get(
  "/profile",
   verifyJWT,
  allowRoles("ADMIN"),
  getAdminProfile
);


// admin sorted view one 
router.get(
  "/sorted-by-department",
  verifyJWT,
  allowRoles("ADMIN"),
  getComplaintsSortedByDepartment
);

router.get(
  "/category-wise",
  verifyJWT,
  allowRoles("ADMIN","SUPER_ADMIN"),
  getComplaintsCategoryWise
);

router.get("/dashboard-stats", 
  verifyJWT, 
  allowRoles("ADMIN","SUPER_ADMIN"),
  getAdminDashboardStats);


export default router;