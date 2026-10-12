import express from "express";

import {
  getAdminPublicContent,
  updatePublicPage,
  resetPublicPage,
} from "../controllers/publicContentController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// ==================================================
// ADMIN WEBSITE CONTENT
// ==================================================

// GET ALL WEBSITE CONTENT
// GET /api/admin/public-content
router.get(
  "/",
  protect,
  getAdminPublicContent
);

// UPDATE WEBSITE PAGE
// PUT /api/admin/public-content/:page
router.put(
  "/:page",
  protect,
  updatePublicPage
);

// RESET WEBSITE PAGE
// PUT /api/admin/public-content/:page/reset
router.put(
  "/:page/reset",
  protect,
  resetPublicPage
);

export default router;