import express from "express";

import { getDashboard } from "../controllers/dashboardController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.get("/", getDashboard);

export default router;