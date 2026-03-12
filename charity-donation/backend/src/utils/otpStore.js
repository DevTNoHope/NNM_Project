const otpStore = new Map();

const saveOtp = (userId, otp, expiresAt) => {
  otpStore.set(userId, { otp, expiresAt });
};

const getOtp = (userId) => {
  return otpStore.get(userId);
};

const deleteOtp = (userId) => {
  otpStore.delete(userId);
};

module.exports = {
  saveOtp,
  getOtp,
  deleteOtp,
};
