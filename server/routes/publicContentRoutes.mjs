import express from "express";

import {
  getPublicPage,
} from "../controllers/publicContentController.mjs";

const router = express.Router();

// ==================================================
// PUBLIC WEBSITE CONTENT
// ==================================================

router.get(
  "/:page",
  getPublicPage
);

export default router;