import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import { useGoogleLogin } from "@react-oauth/google";
import AuthOptionButton from '../components/auth/AuthOptionButton';
import { FcGoogle } from "react-icons/fc";
import { FiShield, FiArrowLeft, FiAlertOctagon } from "react-icons/fi";

const AdminRoute = () => {
    const { user, loading, login } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            setGoogleLoading(true);
            setErrorMsg("");

            const googleRes = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                }
            );
            const googleUser = await googleRes.json();

            // Sends userinfo to backend for verification/registration
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
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Google login failed");
            }

            const { accessToken, user: loggedInUser } = data.data;

            if (loggedInUser.role !== 'ADMIN') {
                throw new Error("This account does not have administrative privileges.");
            }

            login(loggedInUser, accessToken);
            window.dispatchEvent(new Event("auth-changed"));
            navigate("/admin");
        } catch (error) {
            console.error("Admin login failed:", error);
            setErrorMsg(error.message || "Admin authentication failed");
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
            setErrorMsg("Google login was cancelled or failed");
        },
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
                fontFamily: "'Inter', sans-serif",
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>

                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    maxWidth: '420px',
                    padding: '2.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
                    margin: '1rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <FiShield size={34} color="white" style={{ transform: 'rotate(5deg)' }} />
                    </div>

                    <h2 style={{
                        color: 'white',
                        fontSize: '1.875rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.025em'
                    }}>
                        Admin Portal
                    </h2>
                    
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        marginBottom: '2rem'
                    }}>
                        {user 
                            ? "Current account lacks permissions. Switch to an admin account." 
                            : "Secured access. Please authenticate to enter the dashboard."}
                    </p>

                    {errorMsg && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'left'
                        }}>
                            <FiAlertOctagon size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '500' }}>{errorMsg}</span>
                        </div>
                    )}

                    <div style={{ marginBottom: '2rem' }}>
                        <AuthOptionButton
                            icon={<FcGoogle size={22} />}
                            label={googleLoading ? "Authenticating..." : "Sign in with Google"}
                            onClick={() => {
                                if (googleLoading) return;
                                googleLogin();
                            }}
                            className="admin-login-btn"
                        />
                        <style>{`
                            .admin-login-btn {
                                width: 100%;
                                background: white !important;
                                color: #0f172a !important;
                                font-weight: 600 !important;
                                padding: 12px 24px !important;
                                border-radius: 12px !important;
                                transition: all 0.2s ease !important;
                                border: 1px solid transparent !important;
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                            }
                            .admin-login-btn:hover {
                                transform: translateY(-2px) !important;
                                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15) !important;
                                background: #f8fafc !important;
                            }
                            .return-home-btn {
                                background: transparent;
                                border: none;
                                color: #64748b;
                                font-size: 0.9rem;
                                font-weight: 500;
                                cursor: pointer;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                transition: color 0.2s ease, background 0.2s ease;
                                padding: 8px 16px;
                                border-radius: 20px;
                            }
                            .return-home-btn:hover {
                                color: #f8fafc;
                                background: rgba(255, 255, 255, 0.05);
                            }
                        `}</style>
                    </div>

                    <button 
                        className="return-home-btn"
                        onClick={() => navigate('/')}
                    >
                        <FiArrowLeft size={16} />
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminRoute;
