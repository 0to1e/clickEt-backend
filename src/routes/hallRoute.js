// routes/hallRoutes.js
import express from "express";
import {
  createHall,
  getAllHalls,
  getHallById,
  updateHall,
  deleteHall,
  toggleHallStatus,
  getHallsByTheatre,
} from "../controller/hallController.js";

import {protectRoute} from '../middleware/auth/routeProtection.js'

const router = express.Router();

router.post("/add", protectRoute() ,createHall);
router.get("/getAll", getAllHalls);
router.get("/theatre/:theatreId", getHallsByTheatre);
router.get("/:id", protectRoute(), getHallById);
router.patch("/update/:id",protectRoute(), updateHall);
router.patch('/toggle/:id',protectRoute(), toggleHallStatus);
router.delete("/delete/:id", protectRoute(), deleteHall);

export default router;