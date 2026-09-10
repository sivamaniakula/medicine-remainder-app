const express = require("express");
const router = express.Router();
const { getMyAlerts, resolveAlert } = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyAlerts);
router.patch("/:id/resolve", protect, resolveAlert);

module.exports = router;
