import http from "./http";

export const getMyProfile = async () => {
  const res = await http.get("/users/me");
  return res.data;
};

export const updateMyProfile = async (payload) => {
  const res = await http.put("/users/me", payload);
  return res.data;
};

export const getPublicProfile = async (userId) => {
  const res = await http.get(`/users/${userId}/profile`);
  return res.data;
};

export const getUserProjects = async (userId) => {
  const res = await http.get(`/users/${userId}/projects`);
  return res.data;
};

export const getUserDonations = async (userId) => {
  const res = await http.get(`/users/${userId}/donations`);
  return res.data;
};

export const sendVerificationOtp = async () => {
  const res = await http.post("/users/send-verification-otp");
  return res.data;
};

export const verifyOtp = async (otp) => {
  const res = await http.post("/users/verify-otp", { otp });
  return res.data;
};
