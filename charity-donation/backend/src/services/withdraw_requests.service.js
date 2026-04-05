const ApiError = require("../utils/apiError");
const withdrawRequestsModel = require("../models/withdraw_requests.model");
const donationsModel = require("../models/donations.model");
const projectsModel = require("../models/projects.model");
const { sendMail } = require("../utils/mailer");
const crypto = require("crypto");

async function getWithdrawRequests() {
  return withdrawRequestsModel.findAll();
}

async function getWithdrawRequestsByFounder(founderId) {
  return withdrawRequestsModel.findByFounderId(founderId);
}

async function getWithdrawRequestById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid request id");

  const request = await withdrawRequestsModel.findById(id);
  if (!request) throw new ApiError(404, "Withdraw request not found");

  return request;
}

async function getAvailableBalance(projectId, type) {
  // Map withdraw type → donation type
  // withdraw_requests.type: 'CRYPTO' | 'BANKING'
  // donations.donation_type: 'CRYPTO' | 'BANKING'

  const donationType = type;
  const totalDonations = await donationsModel.getSumByProjectAndType(projectId, donationType);

  // BANKING (BANKING): APPROVED = admin đã chuyển tiền → final
  // CRYPTO: APPROVED = admin duyệt (reserve) + CLAIMED = founder đã claim on-chain → final
  // Cả hai đều trừ PENDING + PENDING_EMAIL để lock balance tránh request vượt
  let statuses;
  if (type === 'CRYPTO') {
    statuses = ['APPROVED', 'CLAIMED', 'PENDING', 'PENDING_EMAIL'];
  } else {
    // BANKING
    statuses = ['APPROVED', 'PENDING', 'PENDING_EMAIL'];
  }

  const totalWithdrawn = await withdrawRequestsModel.getSumByProjectAndType(projectId, type, statuses);

  const balance = totalDonations - totalWithdrawn;
  return balance > 0 ? balance : 0;
}

async function createWithdrawRequest(payload) {
  const { projectId, founderId, amount, note, type, bankName, accountNumber, accountName } = payload;

  if (!projectId || !founderId || !amount || !type) {
    throw new ApiError(400, "projectId, founderId, amount, and type are required");
  }

  // 1. Check project existence and ownership
  const project = await projectsModel.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.founder_id !== founderId) {
    throw new ApiError(403, "You are not the founder of this project");
  }

  // 2. Validate type-specific data
  if (type === 'BANKING') {
    if (!bankName || !accountNumber || !accountName) {
      throw new ApiError(400, "Banking information is required for BANKING type");
    }
  }

  // 3. Check available balance
  const availableBalance = await getAvailableBalance(projectId, type);
  if (amount > availableBalance) {
    throw new ApiError(400, `Insufficient ${type} balance. Available: ${availableBalance}`);
  }

  // 4. Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // 5. Create request in PENDING_EMAIL status
  const newId = await withdrawRequestsModel.create({
    projectId,
    founderId,
    amount,
    note,
    type,
    bankName,
    accountNumber,
    accountName,
    verificationToken
  });

  // 6. Send verification email
  // We need the founder's email. We can get it from usersModel or assume it's in the project/context.
  // For now, let's fetch it.
  const usersModel = require("../models/users.model");
  const founder = await usersModel.findById(founderId);

  if (founder && founder.email) {
    let detailsHtml = "";
    if (type === 'CRYPTO') {
      detailsHtml = `<p><strong>Wallet Address:</strong> ${founder.linked_wallet || 'N/A'}</p>`;
    } else {
      detailsHtml = `
        <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin: 12px 0;">
          <p style="margin: 0;"><strong>Bank Name:</strong> ${bankName}</p>
          <p style="margin: 4px 0;"><strong>Account Number:</strong> ${accountNumber}</p>
          <p style="margin: 0;"><strong>Account Holder:</strong> ${accountName}</p>
        </div>
      `;
    }

    const verifyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-withdrawal?token=${verificationToken}`;
    await sendMail({
      to: founder.email,
      subject: "[HopeFund] Withdrawal Confirmation Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Confirm Your Withdrawal Request</h2>
          <p>Hello <strong>${founder.name || 'Founder'}</strong>,</p>
          <p>A withdrawal request has been created for your project: <strong>${project.title}</strong></p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Amount:</strong> $${Number(amount).toLocaleString()}</p>
            <p style="margin: 5px 0 0;"><strong>Method:</strong> ${type}</p>
          </div>

          <p><strong>Withdrawal Destination:</strong></p>
          ${detailsHtml}

          <p style="margin-top: 25px;">Please click the button below to confirm and verify this request:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 999px; font-weight: bold; display: inline-block;">Confirm Request</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #6b7280; word-break: break-all;">${verifyLink}</p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">If you did not initiate this request, please contact support immediately.</p>
          <p style="font-size: 12px; color: #9ca3af;">Thank you,<br/>The HopeFund Team</p>
        </div>
      `
    });
  }

  return { id: newId, message: "Withdrawal request created. A confirmation email has been sent to your address." };
}

async function verifyWithdrawal(token) {
  if (!token) throw new ApiError(400, "Verification token is required");

  const request = await withdrawRequestsModel.findByVerificationToken(token);
  if (!request) throw new ApiError(404, "Invalid or expired verification token");

  if (request.status !== 'PENDING_EMAIL') {
    throw new ApiError(400, "Request is already verified or processed");
  }

  await withdrawRequestsModel.updateStatus(request.id, 'PENDING');
  await withdrawRequestsModel.clearVerificationToken(request.id);

  // Send realtime notification to Admin
  try {
    const notificationsModel = require("../models/notifications.model");
    const { getIO } = require("../utils/socket");
    const notification = await notificationsModel.createNotification({
      userId: null,
      title: "New Withdrawal Request",
      message: `A manual withdrawal request for $${request.amount} has been verified and needs approval.`,
      type: "WITHDRAWAL_REQUESTED",
      relatedId: request.id
    });
    getIO().to("admin_room").emit("new_notification", notification);
  } catch (error) {
    console.error("Failed to notify admin of new withdrawal:", error);
  }

  return { message: "Email verified successfully. Your request is now pending Admin approval." };
}

module.exports = {
  getWithdrawRequests,
  getWithdrawRequestsByFounder,
  getWithdrawRequestById,
  getAvailableBalance,
  createWithdrawRequest,
  verifyWithdrawal
};
