import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../Components/Sidebar/Sidebar';
import { Outlet } from 'react-router';
import Header from '../../../Components/Header/Header';
import { useAuth } from '../../../Auth/AuthContext';

const Inicio = () => {
    const { currentUser } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        currentUser.rol === 'admin' ? navigate('/lista/usuarios') : navigate('/asesoria/buscar');

    }, [currentUser]);

    return (
        <div className="d-block d-md-flex h-100">
            <Sidebar />
            <Header/>
            <Outlet />
        </div>
    );
}

export default Inicio;
