import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGoogleLogin } from "@react-oauth/google";
import AuthOptionButton from "../../components/auth/AuthOptionButton";
import { useAuth } from "../../context/AuthContext";
import useWalletAuth from "../../hook/wallet/useWalletAuth";
import { FcGoogle } from "react-icons/fc";
import { CiWallet } from "react-icons/ci";
import { alertError } from "../../utils/alert";
import "./SignInPage.css";

const SignInPage = () => {
  const navigate = useNavigate();
  const shouldAutoLoginRef = useRef(false);
  const isLoggingInRef = useRef(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const { isConnected, displayAddress, loading, loginWithWallet } =
    useWalletAuth();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setGoogleLoading(true);

      // Lấy info user từ Google bằng access token
      const googleRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        },
      );

      const googleUser = await googleRes.json();

      // Gửi thông tin sang BE để login / signup
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: googleUser.email,
            googleSub: googleUser.sub,
            name: googleUser.name,
            avatar: googleUser.picture,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Google login failed");
      }

      const { accessToken, user } = data.data;

      login(user, accessToken);
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
      alertError("Login Failed", error.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    ux_mode: "popup",
    onSuccess: handleGoogleSuccess,
    onError: () => {
      alertError("Login Failed", "Google login failed");
    },
  });

  const handleWalletLogin = async () => {
    try {
      await loginWithWallet();
      navigate("/");
    } catch (error) {
      console.error("Wallet login failed:", error);
      alertError("Login Failed", error.message || "Wallet login failed");
    }
  };

  useEffect(() => {
    const autoLoginAfterConnect = async () => {
      if (
        !isConnected ||
        !shouldAutoLoginRef.current ||
        isLoggingInRef.current
      ) {
        return;
      }

      try {
        isLoggingInRef.current = true;
        await handleWalletLogin();
      } finally {
        shouldAutoLoginRef.current = false;
        isLoggingInRef.current = false;
      }
    };

    autoLoginAfterConnect();
  }, [isConnected]);

  return (
    <div className="signin-page">
      <div className="signin-left-panel">
        <div className="signin-brand-content">
          <Link to="/" className="signin-logo">
            <span className="signin-logo-icon">🌿</span>
            <span className="signin-logo-text">HopeFund</span>
          </Link>

          <div className="signin-visual-container">
            <h1 className="signin-welcome-text">
              Welcome to sign in to HopeFund
            </h1>
            <p className="signin-welcome-subtext">
              Empowering changemakers through transparent crypto giving.
            </p>
          </div>
        </div>
      </div>

      <div className="signin-right-panel">
        <div className="signin-form-container">
          <div className="signin-header">
            <h2>Sign in to HopeFund</h2>
            <p>Please sign in to your account and start using HopeFund.</p>
          </div>

          <div className="signin-options">
            <AuthOptionButton
              icon={<FcGoogle size={22} />}
              label={googleLoading ? "Signing in..." : "Continue with Google"}
              onClick={() => {
                if (googleLoading) return;
                googleLogin();
              }}
            />

            <div className="signin-divider">
              <span>OR</span>
            </div>

            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => {
                const label = loading
                  ? "Signing in..."
                  : isConnected
                    ? `Continue as ${displayAddress}`
                    : "Continue with Wallet";

                return (
                  <AuthOptionButton
                    icon={<CiWallet size={22} />}
                    label={label}
                    onClick={async () => {
                      if (!mounted || loading) return;

                      if (!isConnected) {
                        shouldAutoLoginRef.current = true;
                        openConnectModal?.();
                        return;
                      }

                      await handleWalletLogin();
                    }}
                  />
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
