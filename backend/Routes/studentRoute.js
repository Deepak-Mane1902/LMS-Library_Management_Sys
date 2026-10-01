import express from 'express';
import { authorizeRoles, authToken } from '../middlewares/authMiddleware.js';
import {searchStudentbyRoll} from '../controllers/studentController.js'

const studentRouter = express.Router();


studentRouter.get("/search-by-roll",authToken,authorizeRoles("admin"),searchStudentbyRoll)

export default studentRouter;