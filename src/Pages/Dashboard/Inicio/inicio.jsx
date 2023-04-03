import React from 'react';
import Sidebar from '../../../Components/Sidebar/Sidebar';
import { Outlet } from 'react-router';

const Inicio = () => {
    return (
        <div className="d-flex h-100">
            <Sidebar />
            <Outlet />
        </div>
    );
}

export default Inicio;
