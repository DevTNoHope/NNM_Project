const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Wallet login failed");
  }

  return data;
};

export const refreshTokenApi = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Refresh token failed");
  }

  return data;
};
