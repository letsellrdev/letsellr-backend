import express from "express";
import {
  getStatistics,
  createStatistic,
  updateStatistic,
  deleteStatistic,
} from "../controller/statistic.controller.js";

const router = express.Router();

router.get("/", getStatistics);
router.post("/", createStatistic);
router.put("/:id", updateStatistic);
router.delete("/:id", deleteStatistic);

export default router;
