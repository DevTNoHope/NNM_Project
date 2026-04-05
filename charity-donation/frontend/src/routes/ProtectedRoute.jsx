import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
