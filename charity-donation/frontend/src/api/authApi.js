const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parseJson = async (response) => {
  return response.json().catch(() => null);
};

export const loginWithGoogleApi = async (googleToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ googleToken }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.message || "Google login failed");
  }

  return data;
};

export const loginWithWalletApi = async ({ address, message, signature }) => {
  const response = await fetch(`${API_BASE_URL}/auth/wallet/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      address,
      message,
      signature,
    }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.message || "Wallet login failed");
  }

  return data;
};

export const refreshTokenApi = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.message || "Refresh token failed");
  }

  return data;
};

export const getMeApi = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.message || "Get profile failed");
  }

  return data;
};
