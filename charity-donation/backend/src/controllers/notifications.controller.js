const notificationsModel = require("../models/notifications.model");
const ApiError = require("../utils/apiError");

async function getNotifications(req, res, next) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let notifications = [];
    if (userRole === "ADMIN") {
      notifications = await notificationsModel.findForAdmins();
    } else {
      notifications = await notificationsModel.findByUserId(userId);
    }

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await notificationsModel.markAsRead(id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === "ADMIN") {
      await notificationsModel.markAllAsReadForAdmins();
    } else {
      await notificationsModel.markAllAsReadForUser(userId);
    }
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
