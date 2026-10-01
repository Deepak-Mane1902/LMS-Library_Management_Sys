import express from "express";

import {
  searchStudentbyRoll,
} from "../controllers/studentController.js";

import {
  authToken,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const studentRouter =
  express.Router();

// ======================================================
// SEARCH STUDENT BY ROLL NUMBER
// ======================================================

studentRouter.get(
  "/search",
  authToken,
  authorizeRoles("admin"),
  searchStudentbyRoll
);

export default studentRouter;