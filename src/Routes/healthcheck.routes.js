import { Router } from "express";
import { healthcheckController } from "../Controllers/healthcheck.controller.js";

const router = Router();
router.route("/").get(healthcheckController);

export default router;