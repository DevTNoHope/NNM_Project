const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");
const authJwt = require("../middleware/authJwt");

router.use(authJwt);

router.get("/", notificationsController.getNotifications);
router.put("/read-all", notificationsController.markAllAsRead);
router.put("/:id/read", notificationsController.markAsRead);

module.exports = router;
