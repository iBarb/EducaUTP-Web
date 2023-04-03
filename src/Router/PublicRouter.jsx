
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const PublicRouter = ({ element }) => {
    const location = useLocation();
    const { currentUser } = useAuth();
    let previusURL = location.state?.from.pathname || "/";
    return (
        !currentUser ? element : <Navigate to={previusURL} />
    );
}

export default PublicRouter;