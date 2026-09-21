import React from 'react'
import { protectedRouteStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className={s.loadingContainer}>
        <div className={s.loadingSpinner}></div>
      </div>
    );

    if (!user) return <Navigate to="/login" replace />
    return children;
};

export default ProtectedRoute
