import { body, param } from "express-validator";

export const createComplaintValidator = [
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters"),

  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("category")
    .isIn(["INFRASTRUCTURE", "HOSTEL", "ACADEMIC", "OTHER"])
    .withMessage("Invalid complaint category"),

  body("isAnonymous")
    .optional()
    .isBoolean()
    .withMessage("isAnonymous must be boolean")
];

export const complaintIdValidator = [
  param("id").isMongoId().withMessage("Invalid complaint ID")
];

export const updateComplaintStatusValidator = [
  body("status")
    .isIn(["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED", "ESCALATED"])
    .withMessage("Invalid status"),

  body("resolutionNote")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Resolution note too short")
];
