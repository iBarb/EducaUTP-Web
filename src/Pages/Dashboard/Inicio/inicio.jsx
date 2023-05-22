import React from 'react';
import Sidebar from '../../../Components/Sidebar/Sidebar';
import { Outlet } from 'react-router';
import Header from '../../../Components/Header/Header';

const Inicio = () => {
    return (
        <div className="d-block d-md-flex h-100">
            <Sidebar />
            <Header/>
            <Outlet />
        </div>
    );
}

export default Inicio;
