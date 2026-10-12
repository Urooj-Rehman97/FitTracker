import express from "express";

import { getAnalytics } from "../controllers/analyticsController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.get("/", getAnalytics);

export default router;