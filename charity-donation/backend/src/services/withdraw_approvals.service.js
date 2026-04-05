const ApiError = require("../utils/apiError");
const withdrawApprovalsModel = require("../models/withdraw_approvals.model");

async function getWithdrawApprovals() {
  return withdrawApprovalsModel.findAll();
}

async function getWithdrawApprovalById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid approval id");

  const approval = await withdrawApprovalsModel.findById(id);
  if (!approval) throw new ApiError(404, "Withdraw approval not found");

  return approval;
}

async function createWithdrawApproval(payload) {
  const { withdrawRequestId, adminId, decision } = payload;
  if (!withdrawRequestId || !adminId || !decision) {
    throw new ApiError(400, "withdrawRequestId, adminId, and decision are required");
  }

  const withdrawRequestsModel = require("../models/withdraw_requests.model");
  const request = await withdrawRequestsModel.findById(withdrawRequestId);
  if (!request) throw new ApiError(404, "Withdraw request not found");

  if (request.status !== 'PENDING') {
    throw new ApiError(400, "Request is not in PENDING status");
  }

  let finalStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  let adminSignature = null;
  let nonce = null;
  let deadline = null;

  // For CRYPTO APPROVED: Admin signs EIP-712 → Founder will claim later
  if (request.type === 'CRYPTO' && decision === 'APPROVED') {
    const projectsModel = require("../models/projects.model");
    const project = await projectsModel.findById(request.project_id);
    
    if (!project || !project.vault_address) {
      throw new ApiError(400, "Project vault address is missing. Cannot sign claim.");
    }

    const { signClaim } = require("../utils/contracts");
    const { parseEther } = require("viem");

    try {
      // Need founder's wallet address for EIP-712 struct
      const usersModel = require("../models/users.model");
      const founder = await usersModel.findById(request.founder_id);
      
      if (!founder || !founder.linked_wallet) {
        throw new ApiError(400, "Founder's wallet address not found. Founder must link a wallet first.");
      }

      const amountInWei = parseEther(request.amount.toString());
      nonce = Number(request.id); // Use request ID as nonce
      deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 3600); // 7 days

      // Admin signs the claim data (must match contract's CLAIM_TYPEHASH)
      // "Claim(uint256 projectId,address founder,uint256 amount,uint256 nonce,uint256 deadline)"
      adminSignature = await signClaim(
        project.vault_address,
        request.project_id,       // projectId
        founder.linked_wallet,    // founder address
        amountInWei, 
        BigInt(nonce), 
        BigInt(deadline)
      );

      // Send claim email to Founder
      const { sendMail } = require("../utils/mailer");

      if (founder && founder.email) {
        const claimUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/claim-withdrawal?` +
          `requestId=${request.id}` +
          `&vault=${project.vault_address}` +
          `&amount=${amountInWei.toString()}` +
          `&nonce=${nonce}` +
          `&deadline=${deadline}` +
          `&signature=${adminSignature}`;

        await sendMail({
          to: founder.email,
          subject: "[HopeFund] Your Withdrawal Has Been Approved!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #10b981; margin-bottom: 20px;">✅ Withdrawal Approved</h2>
              <p>Hello <strong>${founder.name || 'Founder'}</strong>,</p>
              <p>Great news! Your withdrawal request for project <strong>${project.title}</strong> has been approved by the Admin.</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Amount:</strong> $${Number(request.amount).toLocaleString()}</p>
                <p style="margin: 5px 0 0;"><strong>Method:</strong> CRYPTO</p>
                <p style="margin: 5px 0 0;"><strong>Expires:</strong> ${new Date(deadline * 1000).toLocaleString()}</p>
              </div>

              <p>To claim your funds, click the button below. You will need to <strong>connect your wallet</strong> (${founder.linked_wallet || 'your registered wallet'}) to sign and complete the transaction.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${claimUrl}" style="background-color: #10b981; color: white; padding: 14px 35px; text-decoration: none; border-radius: 999px; font-weight: bold; display: inline-block; font-size: 16px;">Claim Your Funds</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link:</p>
              <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${claimUrl}</p>
              
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="font-size: 12px; color: #9ca3af;">This claim link expires in 7 days. If you did not request this, please contact support.</p>
              <p style="font-size: 12px; color: #9ca3af;">Thank you,<br/>The HopeFund Team</p>
            </div>
          `
        });
      }
    } catch (error) {
      console.error("EIP-712 signing failed:", error);
      throw new ApiError(500, `Signing failed: ${error.message}`);
    }
  }

  // 1. Create approval record (with signature data for CRYPTO)
  const newId = await withdrawApprovalsModel.create({ 
    withdrawRequestId, 
    adminId, 
    decision,
    adminSignature,
    nonce,
    deadline
  });

  // 2. Update withdraw request status
  await withdrawRequestsModel.updateStatus(withdrawRequestId, finalStatus);

  // Send realtime notification to Founder
  try {
    const notificationsModel = require("../models/notifications.model");
    const { getIO } = require("../utils/socket");
    const notification = await notificationsModel.createNotification({
      userId: request.founder_id,
      title: finalStatus === "APPROVED" ? "Withdrawal Approved" : "Withdrawal Rejected",
      message: `Your withdrawal request for $${request.amount} has been ${finalStatus.toLowerCase()}.`,
      type: "WITHDRAWAL_REVIEWED",
      relatedId: withdrawRequestId
    });
    getIO().to(`user_${request.founder_id}`).emit("new_notification", notification);
  } catch (error) {
    console.error("Failed to notify founder of withdrawal review:", error);
  }

  return { id: newId, status: finalStatus };
}

module.exports = {
  getWithdrawApprovals,
  getWithdrawApprovalById,
  createWithdrawApproval
};
