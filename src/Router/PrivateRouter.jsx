import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';


const PrivateRouter = ({ element }) => {
    const location = useLocation();
    const { currentUser } = useAuth();

    return (
        currentUser ? element : <Navigate to={"/login"} state={{ from: location }} />
    );
}

export default PrivateRouter;