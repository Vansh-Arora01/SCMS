// src/Routes/college.routes.js
import express from "express";
import { createCollege } from "../Controllers/college.controller.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { allowRoles } from "../Middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyJWT,
  allowRoles("SUPER_ADMIN"),
  createCollege
);

export default router;
