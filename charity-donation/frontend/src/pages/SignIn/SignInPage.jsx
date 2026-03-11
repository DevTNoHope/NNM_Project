import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import AuthOptionButton from "../../components/auth/AuthOptionButton";
import http from "../../api/http";
import { useAuth } from "../../context/AuthContext";
import useWalletAuth from "../../hook/wallet/useWalletAuth";
import "./SignInPage.css";

const SignInPage = () => {
  const navigate = useNavigate();

  const googleBtnRef = useRef(null);
  const shouldAutoLoginRef = useRef(false);
  const isLoggingInRef = useRef(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const { isConnected, displayAddress, loading, loginWithWallet } =
    useWalletAuth();

  const handleGoogleCredential = async (response) => {
    try {
      setGoogleLoading(true);

      const res = await http.post("/api/auth/login", {
        googleToken: response.credential,
      });

      const { accessToken, user } = res.data.data;

      login(user, accessToken);
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
      console.error("Error response:", error?.response?.data);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const existingScript = document.getElementById("google-gsi-script");

    const initializeGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      googleBtnRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 340,
      });
    };

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, []);

  const handleWalletLogin = async () => {
    try {
      await loginWithWallet();
      navigate("/");
    } catch (error) {
      console.error("Wallet login failed:", error);
      alert(error.message || "Wallet login failed");
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

            <div className="signin-abstract-shape">
              <div className="shape-circle-small"></div>
              <div className="shape-curve"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="signin-right-panel">
        <button
          className="signin-close-btn"
          onClick={() => navigate("/")}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="signin-form-container">
          <div className="signin-header">
            <h2>Sign in to HopeFund</h2>
            <p>Please sign in to your account and start using HopeFund.</p>
          </div>

          <div className="signin-options">
            <div className="signin-google-wrap">
              {googleLoading && (
                <AuthOptionButton
                  icon={
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  }
                  label="Signing in with Google..."
                  onClick={() => {}}
                />
              )}
              <div ref={googleBtnRef} className="signin-google-button"></div>
            </div>

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
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                    }
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