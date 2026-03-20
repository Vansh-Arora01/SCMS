import express from "express";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";
import { createAdmin,deleteAdmin ,getAllAdmins, getSuperAdminProfile} from "../Controllers/superAdmin/superadmin.controller.js";
import { createCollege,getColleges } from "../Controllers/college.controller.js";

const router = express.Router();

router.post(
  "/createAdmin",
  verifyJWT,
  allowRoles("SUPER_ADMIN"),
  createAdmin
);

router.delete(
  "/:id",
  verifyJWT,
  allowRoles("SUPER_ADMIN"),
  deleteAdmin
);
router.post(
  "/createCollege",
  verifyJWT,
  allowRoles("SUPER_ADMIN"),
  createCollege
);
router.get(
  "/colleges",
  verifyJWT,
  allowRoles("SUPER_ADMIN"),
  getColleges
);
router.get(
  "/profile",
 verifyJWT,
  allowRoles("SUPER_ADMIN"),
  getSuperAdminProfile
);
router.get(
  "/all-admins",
  verifyJWT,
  allowRoles("SUPER_ADMIN"),
  getAllAdmins
);

export default router;