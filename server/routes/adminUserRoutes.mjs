import express from "express";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getUserStats,
} from "../controllers/adminUserController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAllUsers);

router.get("/stats", getUserStats);

router.post("/", createUser);

router.get("/:id", getUserById);

router.put("/:id", updateUser);

router.put("/:id/status", updateUserStatus);

router.delete("/:id", deleteUser);

export default router;