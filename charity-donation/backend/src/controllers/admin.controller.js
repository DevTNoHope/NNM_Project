const adminService = require("../services/admin.service");
const badgesService = require("../services/badges.service");
const { ok, created } = require("../utils/response");

async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    return ok(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function getAllProjects(req, res, next) {
  try {
    const projects = await adminService.getAllAdminProjects();
    return ok(res, projects, "All projects fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function approveProjectRequest(req, res, next) {
  try {
    const { note } = req.body;
    const adminId = req.user ? req.user.id : 1; 

    const result = await adminService.reviewProject(req.params.id, adminId, "APPROVED", note || "");
    return ok(res, result, "Project approved successfully");
  } catch (error) {
    next(error);
  }
}

async function rejectProjectRequest(req, res, next) {
  try {
    const { note } = req.body;
    const adminId = req.user ? req.user.id : 1; 

    // Reject bắt buộc phải có lý do (tùy chọn theo spec, nhưng ta cũng hỗ trợ "" nếu trống)
    const result = await adminService.reviewProject(req.params.id, adminId, "REJECTED", note || "");
    return ok(res, result, "Project rejected successfully");
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsersWithStats();
    return ok(res, users, "All users fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function getUserHistory(req, res, next) {
  try {
    const history = await adminService.getUserDonationHistory(req.params.id);
    return ok(res, history, "User donation history fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function createVault(req, res, next) {
  try {
    const projectId = Number(req.params.id);

    const projectsModel = require("../models/projects.model");
    const usersModel = require("../models/users.model");
    const { uploadJsonToIPFS } = require("../utils/pinata");
    const { keccak256, toHex } = require("viem");
    const { deployVaultViaFactory } = require("../utils/contracts");

    const project = await projectsModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: "Project must be APPROVED to create vault" });
    }

    const founder = await usersModel.findById(project.founder_id);
    if (!founder?.linked_wallet) {
      return res.status(400).json({ success: false, message: "Founder has no linked wallet address" });
    }

    // 1. Create metadata JSON
    const metadata = {
      title: project.title,
      founder: founder.linked_wallet,
      founderName: founder.name || "Unknown",
      description: project.description || "",
      coverImage: project.cover_image_url || "",
      goalAmount: Number(project.goal_amount),
      category: project.category_name || "General",
      projectId: project.id,
      createdAt: new Date().toISOString()
    };

    // 2. Upload to Pinata IPFS
    const { cid, url } = await uploadJsonToIPFS(metadata, `HopeFund_Project_${projectId}`);

    // 3. Hash CID to bytes32 for metaHash
    const metaHash = keccak256(toHex(cid));

    // 4. Deploy vault via Factory contract on-chain
    const { vaultAddress, txHash } = await deployVaultViaFactory(
      projectId,
      founder.linked_wallet,
      metaHash
    );

    // 5. Save vault_address, ipfs_cid, meta_hash and set PUBLISHED
    await projectsModel.updateVaultAndPublish(projectId, vaultAddress, cid, metaHash);

    // 6. Send notification & email to Founder
    try {
      const notificationsModel = require("../models/notifications.model");
      const { getIO } = require("../utils/socket");
      const notification = await notificationsModel.createNotification({
        userId: project.founder_id,
        title: "Project Published",
        message: `Your project "${project.title}" has been successfully published to the blockchain!`,
        type: "PROJECT_PUBLISHED",
        relatedId: projectId
      });
      getIO().to(`user_${project.founder_id}`).emit("new_notification", notification);
      
      if (founder && founder.email) {
        const { sendMail } = require("../utils/mailer");
        await sendMail({
          to: founder.email,
          subject: `[HopeFund] Project Published 🎉`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #10b981; margin-bottom: 20px;">
                Project Published 🎉
              </h2>
              <p>Hello <strong>${founder.name || 'Founder'}</strong>,</p>
              <p>Great news! Your project <strong>${project.title}</strong> has been successfully published to the blockchain and is now live.</p>
              <p><strong>Vault Address:</strong> ${vaultAddress}</p>
              <p>You can now start receiving donations. Share your project with the world!</p>
              <p>Thank you,<br/>The HopeFund Team</p>
            </div>
          `
        });
      }
    } catch (notifErr) {
      console.error("Failed to send publish notification:", notifErr);
    }

    return ok(res, {
      vaultAddress,
      txHash,
      ipfsCid: cid,
      ipfsUrl: url,
      metaHash
    }, "Vault created and project published successfully");
  } catch (error) {
    console.error("Create vault error:", error);
    next(error);
  }
}

async function getDashboardChart(req, res, next) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await adminService.getDashboardChart(year);

    return ok(res, data, "Chart data fetched successfully");
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getDashboard,
  getAllProjects,
  approveProjectRequest,
  rejectProjectRequest,
  getAllUsers,
  getUserHistory,
  createVault,
  getDashboardChart
};
