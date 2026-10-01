import express from "express";

import {
  applyFine,
  clearFine,
  getFineSettings,
  getIssues,
  getStudentIssues,
  issueManualBook,
  returnBook,
  updateFineSettings,
} from "../controllers/bookController.js";

import {
  authorizeRoles,
  authToken,
} from "../middlewares/authMiddleware.js";

const bookRouter =
  express.Router();

// ======================================================
// FINE SETTINGS
// ======================================================

// Get fine settings
bookRouter.get(
  "/fine-settings",
  authToken,
  getFineSettings
);

// ======================================================
// STUDENT ROUTES
// ======================================================

// Get logged-in student's issues
bookRouter.get(
  "/issues/student",
  authToken,
  authorizeRoles("user"),
  getStudentIssues
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Get all issues
bookRouter.get(
  "/issues",
  authToken,
  authorizeRoles("admin"),
  getIssues
);

// Issue manual book
bookRouter.post(
  "/issue-manual",
  authToken,
  authorizeRoles("admin"),
  issueManualBook
);

// Return book
bookRouter.put(
  "/issues/:id/return",
  authToken,
  authorizeRoles("admin"),
  returnBook
);

// Apply fine
bookRouter.put(
  "/issues/:id/fine",
  authToken,
  authorizeRoles("admin"),
  applyFine
);

// Clear fine
bookRouter.put(
  "/issues/:id/clear-fine",
  authToken,
  authorizeRoles("admin"),
  clearFine
);

// Update fine settings
bookRouter.put(
  "/fine-settings",
  authToken,
  authorizeRoles("admin"),
  updateFineSettings
);

export default bookRouter;