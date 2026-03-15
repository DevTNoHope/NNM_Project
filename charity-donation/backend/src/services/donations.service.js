const ApiError = require("../utils/apiError");
const donationsModel = require("../models/donations.model");
const projectsModel = require("../models/projects.model");
const vnpayService = require("./vnpay.service");
const env = require("../config/env");

function generateVnpTxnRef(donationId) {
  // Keep txnRef short, alphanumeric, max 100 chars
  return `DN${donationId}T${Date.now()}`;
}

async function createDonation(payload) {
  const {
    projectId,
    userId,
    amount,
    donationType = "CRYPTO",
    donorWallet = null,
    tokenAddress = null,
    ipAddr = "127.0.0.1"
  } = payload;

  const normalizedProjectId = Number(projectId);
  const normalizedUserId = Number(userId);
  const normalizedAmount = Number(amount);

  if (!Number.isInteger(normalizedProjectId) || normalizedProjectId <= 0) {
    throw new ApiError(400, "Invalid projectId");
  }

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new ApiError(400, "amount must be > 0");
  }

  if (!["CRYPTO", "BANKING"].includes(donationType)) {
    throw new ApiError(400, "donationType must be CRYPTO or BANKING");
  }

  const project = await projectsModel.findById(normalizedProjectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (donationType === "CRYPTO") {
    const donationId = await donationsModel.create({
      projectId: normalizedProjectId,
      userId: normalizedUserId,
      amount: normalizedAmount,
      donationType,
      donorWallet,
      tokenAddress,
      status: "PENDING"
    });

    return {
      id: donationId,
      donationType,
      status: "PENDING"
    };
  }

const donationId = await donationsModel.create({
  projectId: normalizedProjectId,
  userId: normalizedUserId,
  amount: normalizedAmount,
  donationType: "BANKING",
  status: "PENDING"
});

  const txnRef = generateVnpTxnRef(donationId);

  await donationsModel.updateVnpTxnRef(donationId, txnRef);

  const paymentUrl = vnpayService.buildPaymentUrl({
    tmnCode: env.vnpay.tmnCode,
    secretKey: env.vnpay.hashSecret,
    vnpUrl: env.vnpay.url,
    returnUrl: env.vnpay.returnUrl,
    txnRef,
    amount: normalizedAmount,
    orderInfo: `DonateProject${normalizedProjectId}`,
    ipAddr
  });

  return {
    id: donationId,
    donationType: "BANKING",
    status: "PENDING",
    vnpay: {
      txnRef,
      paymentUrl
    }
  };
}

async function handleVnpayReturn(query) {
  const isValid = vnpayService.verifyReturn(query, env.vnpay.hashSecret);

  if (!isValid) {
    throw new ApiError(400, "Invalid VNPay checksum");
  }

  const txnRef = query.vnp_TxnRef;
  const responseCode = query.vnp_ResponseCode;
  const transactionStatus = query.vnp_TransactionStatus;
  const vnpTransactionNo = query.vnp_TransactionNo || null;

  if (!txnRef) {
    throw new ApiError(400, "Missing vnp_TxnRef");
  }

  const donation = await donationsModel.findByVnpTxnRef(txnRef);
  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  if (responseCode === "00" && transactionStatus === "00") {
    await donationsModel.markConfirmedByVnpTxnRef(txnRef, vnpTransactionNo);
  } else {
    await donationsModel.markFailedByVnpTxnRef(txnRef);
  }

  return {
    projectId: donation.project_id,
    txnRef,
    responseCode,
    transactionStatus
  };
}

async function getDonationStatus(donationId, userId) {
  const donation = await donationsModel.findById(Number(donationId));
  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  if (Number(donation.user_id) !== Number(userId)) {
    throw new ApiError(403, "Forbidden");
  }

  return {
    id: donation.id,
    status: donation.status,
    donationType: donation.donation_type,
    confirmedAt: donation.confirmed_at
  };
}

async function getDonationsByProjectId(projectId) {
  if (!Number.isFinite(Number(projectId))) {
    throw new ApiError(400, "Invalid project id");
  }

  // Possibly verify project exists first?
  const project = await projectsModel.findById(Number(projectId));
  if (!project) throw new ApiError(404, "Project not found");

  return donationsModel.findByProjectId(Number(projectId));
}

module.exports = {
  createDonation,
  handleVnpayReturn,
  getDonationStatus,
  getDonationsByProjectId
};