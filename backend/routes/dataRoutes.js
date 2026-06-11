const express = require("express");
const {
  getSummary,
  getResponsaveis,
  getStatusHistory,
  getAnalytics,
} = require("../controllers/dataController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(auth);
router.get("/summary", getSummary);
router.get("/analytics", getAnalytics);
router.get("/responsaveis", getResponsaveis);
router.get("/status-history", getStatusHistory);

module.exports = router;
