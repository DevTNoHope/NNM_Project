import http, { setAccessToken } from "./http";

export const loginWithGoogleApi = async ({ email, googleSub, name }) => {
  const res = await http.post("/auth/login", {
    email,
    googleSub,
    name,
  });

  const { accessToken, user } = res.data.data;

  setAccessToken(accessToken);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));

  return res.data;
};

export const loginWithWalletApi = async ({ address, message, signature }) => {
  const res = await http.post("/auth/wallet/login", {
    address,
    message,
    signature,
  });

  const { accessToken, user } = res.data.data;

  setAccessToken(accessToken);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));

  return res.data;
};

export const refreshTokenApi = async () => {
  const res = await http.post("/auth/refresh");

  const { accessToken, user } = res.data.data;

  setAccessToken(accessToken);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));
  }

  return res.data;
};

export const getMeApi = async () => {
  const res = await http.get("/auth/me");
  return res.data;
};

export const logoutApi = async () => {
  const res = await http.post("/auth/logout");

  setAccessToken(null);
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth:logout"));

  return res.data;
};
