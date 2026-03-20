import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthOptionButton from '../../components/auth/AuthOptionButton';
import http from '../../api/http';
import { useAuth } from '../../context/AuthContext';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const existingScript = document.getElementById('google-gsi-script');

    const initializeGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      googleBtnRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 340,
      });
    };

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, []);

  const handleGoogleCredential = async (response) => {
    try {
      setLoading(true);

      console.log('CLIENT ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
      console.log('GOOGLE CREDENTIAL RESPONSE:', response);

      const res = await http.post('/auth/login', {
        googleToken: response.credential,
      });

      console.log('LOGIN RESPONSE:', res.data);

      const { accessToken, user } = res.data.data;

      login(user, accessToken);

      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      console.error('Error response:', error?.response?.data);
      alert(
        error?.response?.data?.message ||
        error?.message ||
        'Google login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWallet = () => {
    console.log('Continue with Wallet');
    alert('Wallet login will be implemented later.');
  };

  return (
    <div className="signin-page">
      <div className="signin-left-panel">
        <div className="signin-brand-content">
          <Link to="/" className="signin-logo">
            <span className="signin-logo-icon">🌿</span>
            <span className="signin-logo-text">HopeFund</span>
          </Link>

          <div className="signin-visual-container">
            <h1 className="signin-welcome-text">Welcome to sign in to HopeFund</h1>
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
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <div ref={googleBtnRef} className="signin-google-button"></div>
            </div>

            <div className="signin-divider">
              <span>OR</span>
            </div>

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
              label={loading ? 'Signing in...' : 'Continue with Wallet'}
              onClick={handleSignInWallet}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
