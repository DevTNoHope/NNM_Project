const ApiError = require("../utils/apiError");
const donationsModel = require("../models/donations.model");
const projectsModel = require("../models/projects.model");
const vnpayService = require("./vnpay.service");
const badgesService = require("./badges.service");
const env = require("../config/env");
const { getUsdToVndRate } = require("./exchangeRate.service");

const {
  createPublicClient,
  http,
  decodeEventLog,
  isAddressEqual,
  parseUnits,
} = require("viem");
const { bscTestnet } = require("viem/chains");

const hopeFundVaultAbi = [
  {
    type: "event",
    name: "Donated",
    inputs: [
      { indexed: true, name: "projectId", type: "uint256" },
      { indexed: true, name: "donor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    anonymous: false,
  },
];

const DONATION_TOKEN_ADDRESS = process.env.DONATION_TOKEN_ADDRESS;
const DONATION_TOKEN_DECIMALS = 18;
const CHAIN_ID = 97;

function generateVnpTxnRef(donationId) {
  return `DN${donationId}T${Date.now()}`;
}

function normalizeDonationType(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function normalizeAddress(address) {
  return String(address || "").trim();
}

function getPublicClient() {
  if (!process.env.RPC_URL) {
    throw new Error("Missing RPC_URL in environment");
  }

  return createPublicClient({
    chain: bscTestnet,
    transport: http(process.env.RPC_URL),
  });
}

async function verifyCryptoDonationOnChain({
  txHash,
  vaultAddress,
  donorWallet,
  expectedAmount,
  expectedProjectId,
}) {
  const publicClient = getPublicClient();

  const receipt = await publicClient.getTransactionReceipt({
    hash: txHash,
  });

  if (!receipt) {
    throw new ApiError(400, "Transaction not found");
  }

  if (receipt.status !== "success") {
    throw new ApiError(400, "Transaction failed");
  }

  const normalizedVaultAddress = normalizeAddress(vaultAddress);
  const normalizedDonorWallet = donorWallet
    ? normalizeAddress(donorWallet)
    : null;

  const matchedLogs = receipt.logs.filter(
    (log) => log.address && isAddressEqual(log.address, normalizedVaultAddress),
  );

  if (!matchedLogs.length) {
    throw new ApiError(400, "No logs found for this vault address");
  }

  let donatedEvent = null;

  for (const log of matchedLogs) {
    try {
      const decoded = decodeEventLog({
        abi: hopeFundVaultAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName === "Donated") {
        donatedEvent = decoded;
        break;
      }
    } catch (_) {
      // skip log không decode được
    }
  }

  if (!donatedEvent) {
    throw new ApiError(400, "Donated event not found in transaction");
  }

  const onChainProjectId = Number(donatedEvent.args.projectId);
  const onChainDonor = donatedEvent.args.donor;
  const onChainAmount = donatedEvent.args.amount;

  if (onChainProjectId !== Number(expectedProjectId)) {
    throw new ApiError(
      400,
      "ProjectId on-chain does not match donation record",
    );
  }

  if (
    normalizedDonorWallet &&
    !isAddressEqual(onChainDonor, normalizedDonorWallet)
  ) {
    throw new ApiError(400, "donorWallet does not match transaction event");
  }

  const expectedAmountOnChain = parseUnits(
    String(expectedAmount),
    DONATION_TOKEN_DECIMALS,
  );

  if (onChainAmount !== expectedAmountOnChain) {
    throw new ApiError(400, "Amount on-chain does not match donation record");
  }

  return {
    txHash,
    donorWallet: onChainDonor,
    amount: onChainAmount.toString(),
    projectId: onChainProjectId,
    blockNumber: receipt.blockNumber?.toString?.() || null,
  };
}

async function createDonation(payload) {
  const {
    projectId,
    userId,
    amount,
    donationType = "CRYPTO",
    donorWallet = null,
    ipAddr = "127.0.0.1",
  } = payload;

  const normalizedProjectId = Number(projectId);
  const normalizedUserId = Number(userId);
  const normalizedAmount = Number(amount);
  const normalizedDonationType = normalizeDonationType(donationType);

  if (!Number.isInteger(normalizedProjectId) || normalizedProjectId <= 0) {
    throw new ApiError(400, "Invalid projectId");
  }

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new ApiError(400, "amount must be > 0");
  }

  if (!["CRYPTO", "BANKING"].includes(normalizedDonationType)) {
    throw new ApiError(400, "donationType must be CRYPTO or BANKING");
  }

  const project = await projectsModel.findById(normalizedProjectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.status !== "PUBLISHED") {
    throw new ApiError(400, "This project is no longer accepting donations");
  }

  if (normalizedDonationType === "CRYPTO") {
    if (!project.vault_address) {
      throw new ApiError(400, "Project does not have vault address");
    }

    if (!DONATION_TOKEN_ADDRESS) {
      throw new ApiError(500, "Missing DONATION_TOKEN_ADDRESS in environment");
    }

    const donationId = await donationsModel.create({
      projectId: normalizedProjectId,
      userId: normalizedUserId,
      amount: normalizedAmount,
      donationType: "CRYPTO",
      donorWallet,
      status: "PENDING",
    });

    return {
      id: donationId,
      donationType: "CRYPTO",
      status: "PENDING",
      amount: normalizedAmount,
      crypto: {
        chainId: CHAIN_ID,
        vaultAddress: project.vault_address,
        tokenAddress: DONATION_TOKEN_ADDRESS,
        decimals: DONATION_TOKEN_DECIMALS,
      },
    };
  }

  const usdToVndRate = await getUsdToVndRate();
  const amountVnd = Math.round(normalizedAmount * usdToVndRate);

  const donationId = await donationsModel.create({
    projectId: normalizedProjectId,
    userId: normalizedUserId,
    amount: normalizedAmount,
    donationType: "BANKING",
    status: "PENDING",
  });

  const txnRef = generateVnpTxnRef(donationId);

  await donationsModel.updateVnpTxnRef(donationId, txnRef);

  const paymentUrl = vnpayService.buildPaymentUrl({
    tmnCode: env.vnpay.tmnCode,
    secretKey: env.vnpay.hashSecret,
    vnpUrl: env.vnpay.url,
    returnUrl: env.vnpay.returnUrl,
    txnRef,
    amount: amountVnd,
    orderInfo: `DonateProject${normalizedProjectId}`,
    ipAddr,
  });

  return {
    id: donationId,
    donationType: "BANKING",
    status: "PENDING",
    amount: normalizedAmount,
    banking: {
      currency: "USD",
      exchangeRate: usdToVndRate,
      amountVnd,
    },
    vnpay: {
      txnRef,
      paymentUrl,
    },
  };
}

async function confirmCryptoDonation(donationId, userId, payload) {
  const normalizedDonationId = Number(donationId);
  const normalizedUserId = Number(userId);
  let txHash = payload.txHash;

  if (typeof txHash === "object" && txHash !== null) {
    txHash = txHash.hash || txHash.transactionHash || "";
  }

  txHash = String(txHash || "").trim();
  const donorWallet = payload.donorWallet
    ? String(payload.donorWallet).trim()
    : null;

  if (!Number.isInteger(normalizedDonationId) || normalizedDonationId <= 0) {
    throw new ApiError(400, "Invalid donationId");
  }

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!txHash) {
    throw new ApiError(400, "txHash is required");
  }

  const donation = await donationsModel.findById(normalizedDonationId);
  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  if (Number(donation.user_id) !== normalizedUserId) {
    throw new ApiError(403, "Forbidden");
  }

  if (donation.donation_type !== "CRYPTO") {
    throw new ApiError(400, "Donation is not CRYPTO");
  }

  if (donation.status === "CONFIRMED") {
    return {
      id: donation.id,
      donationType: donation.donation_type,
      status: donation.status,
      txHash: donation.tx_hash,
      confirmedAt: donation.confirmed_at,
    };
  }

  const duplicatedTx = await donationsModel.findByTxHash(txHash);
  if (duplicatedTx && Number(duplicatedTx.id) !== normalizedDonationId) {
    throw new ApiError(409, "txHash already used by another donation");
  }

  const project = await projectsModel.findById(Number(donation.project_id));
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.vault_address) {
    throw new ApiError(400, "Project does not have vault address");
  }

  const verified = await verifyCryptoDonationOnChain({
    txHash,
    vaultAddress: project.vault_address,
    donorWallet,
    expectedAmount: donation.amount,
    expectedProjectId: donation.project_id,
  });

  await donationsModel.markCryptoConfirmed(
    normalizedDonationId,
    txHash,
    verified.donorWallet,
  );

  await badgesService.syncUserBadges(normalizedUserId);

  const updatedDonation = await donationsModel.findById(normalizedDonationId);

  return {
    id: updatedDonation.id,
    donationType: updatedDonation.donation_type,
    status: updatedDonation.status,
    txHash: updatedDonation.tx_hash,
    confirmedAt: updatedDonation.confirmed_at,
    onChain: {
      chainId: CHAIN_ID,
      donorWallet: verified.donorWallet,
      amount: verified.amount,
      blockNumber: verified.blockNumber,
      vaultAddress: project.vault_address,
      tokenAddress: DONATION_TOKEN_ADDRESS,
    },
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
    if (donation.user_id) {
      await badgesService.syncUserBadges(donation.user_id);
    }
  } else {
    await donationsModel.markFailedByVnpTxnRef(txnRef);
  }

  return {
    projectId: donation.project_id,
    txnRef,
    responseCode,
    transactionStatus,
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
    confirmedAt: donation.confirmed_at,
    txHash: donation.tx_hash || null,
  };
}

async function getTopDonations(limit) {
  return donationsModel.findTopDonations(limit);
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
  confirmCryptoDonation,
  handleVnpayReturn,
  getDonationStatus,
  getTopDonations,
  getDonationsByProjectId
};
