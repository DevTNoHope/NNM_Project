import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fa' }}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (user.role !== 'ADMIN') {
        // Not an admin, explicitly show no permission
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fa', fontFamily: 'Inter, sans-serif' }}>
                <h2 style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '2rem' }}>Access Denied 🛑</h2>
                <p style={{ color: '#4B5563', marginBottom: '2rem', fontSize: '1.1rem' }}>You do not have permission to view the Charity Admin Dashboard.</p>
                <Link to="/" style={{ padding: '12px 24px', backgroundColor: '#7C4DFF', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                    Return to Homepage
                </Link>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminRoute;
