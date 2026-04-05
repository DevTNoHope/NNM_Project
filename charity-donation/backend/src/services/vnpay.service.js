const crypto = require("crypto");

/**
 * Format Date to VNPay's yyyyMMddHHmmss format
 */
function formatDate(date) {
  const yyyy = date.getFullYear().toString();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

/**
 * Sort object keys alphabetically (VNPay requirement)
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

/**
 * Build VNPay payment URL following the official VNPay spec:
 * 1. All param values must be strings
 * 2. Sort params alphabetically by key
 * 3. Build query string with encodeURIComponent for each value
 * 4. Sign the query string with HMAC-SHA512
 * 5. Append vnp_SecureHash to the URL
 */
function buildPaymentUrl({
  tmnCode,
  secretKey,
  vnpUrl,
  returnUrl,
  txnRef,
  amount,
  orderInfo,
  ipAddr = "127.0.0.1",
  locale = "vn"
}) {
  const now = new Date();

  // All values MUST be strings
  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(txnRef),
    vnp_OrderInfo: String(orderInfo),
    vnp_OrderType: "other",
    vnp_Amount: String(Math.round(Number(amount) * 100)),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: formatDate(now)
  };

  const sortedParams = sortObject(params);

  // Build the signing string: key=encodedValue&key=encodedValue...
  const signData = Object.keys(sortedParams)
    .map(
      (key) =>
        `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")}`
    )
    .join("&");

  // HMAC SHA512
  const hmac = crypto.createHmac("sha512", secretKey);
  const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Final URL = vnpUrl + ? + signData + &vnp_SecureHash=hash
  return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}

/**
 * Verify VNPay return params
 * Same signing logic: sort, encode, HMAC, then compare
 */
function verifyReturn(params, secretKey) {
  const cloned = { ...params };
  const receivedHash = cloned.vnp_SecureHash;

  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  const sortedParams = sortObject(cloned);

  const signData = Object.keys(sortedParams)
    .map(
      (key) =>
        `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")}`
    )
    .join("&");

  const hmac = crypto.createHmac("sha512", secretKey);
  const expectedHash = hmac
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return expectedHash === receivedHash;
}

module.exports = {
  buildPaymentUrl,
  verifyReturn
};