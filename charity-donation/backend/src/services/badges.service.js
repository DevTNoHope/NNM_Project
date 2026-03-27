const badgesModel = require("../models/badges.model");
const userBadgesModel = require("../models/user_badges.model");
const donationsModel = require("../models/donations.model");
const ApiError = require("../utils/apiError");

const badgesService = {
  createBadge: async (payload) => {
    const existingBadge = await badgesModel.findBySlug(payload.slug);
    if (existingBadge) {
      throw new ApiError(400, "Badge slug already exists");
    }
    const result = await badgesModel.create(payload);
    return await badgesModel.findById(result.id);
  },

  updateBadge: async (id, payload) => {
    const existing = await badgesModel.findById(id);
    if (!existing) {
      throw new ApiError(404, "Badge not found");
    }

    if (payload.slug && payload.slug !== existing.slug) {
      const slugExists = await badgesModel.findBySlug(payload.slug);
      if (slugExists) {
        throw new ApiError(400, "Badge slug already exists");
      }
    }

    const updateData = {
      name: payload.name || existing.name,
      slug: payload.slug || existing.slug,
      description: payload.description !== undefined ? payload.description : existing.description,
      min_points: payload.minPoints !== undefined ? payload.minPoints : existing.min_points,
      color: payload.color !== undefined ? payload.color : existing.color,
      icon_url: payload.iconUrl !== undefined ? payload.iconUrl : existing.icon_url,
    };

    const result = await badgesModel.update(id, updateData);
    return await badgesModel.findById(result.id);
  },

  deleteBadge: async (id) => {
    const existing = await badgesModel.findById(id);
    if (!existing) {
      throw new ApiError(404, "Badge not found");
    }
    await badgesModel.remove(id);
    return { success: true };
  },

  getAllBadges: async () => {
    return await badgesModel.findAll();
  },

  getBadgeById: async (id) => {
    const badge = await badgesModel.findById(id);
    if (!badge) {
      throw new ApiError(404, "Badge not found");
    }
    return badge;
  },

  // User methods
  getMyBadges: async (userId) => {
    // Auto-sync backward compatibility for past donations
    // Using donated points instead of received points
    await badgesService.syncUserBadges(userId);
    const userBadges = await userBadgesModel.getUserBadges(userId);
    return userBadges;
  },

  getMyBadgeProgress: async (userId) => {
    const totalPoints = Number(await donationsModel.getTotalDonatedByUserId(userId));
    const allBadges = await badgesModel.findAll();

    // Determine current and next badge
    let currentBadge = null;
    let nextBadge = null;

    for (const badge of allBadges) {
      if (totalPoints >= Number(badge.min_points)) {
        currentBadge = badge;
      } else if (!nextBadge) {
        nextBadge = badge;
      }
    }

    const pointsNeeded = nextBadge ? Number(nextBadge.min_points) - totalPoints : 0;
    const progressPercent = nextBadge ? Math.min(100, Math.floor((totalPoints / Number(nextBadge.min_points)) * 100)) : 100;

    return {
      totalPoints,
      currentBadge,
      nextBadge,
      pointsNeeded,
      progressPercent,
      allBadges
    };
  },

  setSelectedBadge: async (userId, badgeId) => {
    const hasBadge = await userBadgesModel.hasBadge(userId, badgeId);
    if (!hasBadge) {
      throw new ApiError(400, "You have not earned this badge yet");
    }

    await userBadgesModel.setSelectedBadge(userId, badgeId);
    return { success: true, message: "Display badge updated successfully" };
  },

  // Auto sync badges for user after donation confirmed
  syncUserBadges: async (userId) => {
    const totalPoints = Number(await donationsModel.getTotalDonatedByUserId(userId));
    const allBadges = await badgesModel.findAll();

    const userBadges = await userBadgesModel.getUserBadges(userId);
    const earnedBadgeIds = new Set(userBadges.map(b => b.badge_id));

    let newlyEarnedBadges = [];

    for (const badge of allBadges) {
      if (totalPoints >= Number(badge.min_points) && !earnedBadgeIds.has(badge.id)) {
        await userBadgesModel.assignBadge(userId, badge.id);
        newlyEarnedBadges.push(badge);
      }
    }

    // Auto-select the highest badge if the user has no selected badge and earned new ones
    if (newlyEarnedBadges.length > 0) {
      const selected = await userBadgesModel.getSelectedBadge(userId);
      if (!selected) {
        // Find highest badge among all earned
        const highestEarned = newlyEarnedBadges[newlyEarnedBadges.length - 1]; // because allBadges are sorted ASC by limit
        await userBadgesModel.setSelectedBadge(userId, highestEarned.id);
      }
    }

    return { synced: true, newlyEarnedBadges };
  }
};

module.exports = badgesService;
