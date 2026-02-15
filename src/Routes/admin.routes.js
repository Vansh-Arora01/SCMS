import express from "express";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";
import {getUnassignedComplaints,assignComplaint,reassignComplaint,getComplaintsSortedByDepartment,getComplaintsCategoryWise} from "../Controllers/admin/admin.complaint.controller.js"
import {createStaff,deleteStaff,getAdminProfile} from "../Controllers/admin/admin.staff.controller.js"

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



export default router;