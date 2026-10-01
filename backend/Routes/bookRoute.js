import express from 'express';
import { authorizeRoles, authToken } from '../middlewares/authMiddleware.js';
import {applyFine, clearFine, getFineSettings, getIssues, getStudentIssues, issueManualBook, returnBook, updateFineSettings} from '../controllers/bookController.js'

const bookRouter = express.Router();

bookRouter.get("/fine-settings", authToken, getFineSettings);
bookRouter.get("/issues/student", authToken, authorizeRoles("user"), getStudentIssues);

// admin
bookRouter.get("/issues", authToken, authorizeRoles("admin"), getIssues);
bookRouter.post("/issue-manual", authToken, authorizeRoles("admin"),issueManualBook);

bookRouter.put("/issues/:id/return", authToken, authorizeRoles("admin"),returnBook);
bookRouter.put("/issues/:id/fine", authToken, authorizeRoles("admin"),applyFine);
bookRouter.put("/issues/:id/clear-fine", authToken, authorizeRoles("admin"),clearFine);
bookRouter.put("/fine-settings", authToken, authorizeRoles("admin"),updateFineSettings);


export default bookRouter;