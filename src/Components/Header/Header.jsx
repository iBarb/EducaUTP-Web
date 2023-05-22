import React from 'react';
import logo from "../../assets/logo.svg";
import { Link } from 'react-router-dom';
import './Header.css';
import Sidebar from '../Sidebar/Sidebar';

const Header = () => {
    return (
        <div className='d-block d-md-none'>
            <div className='header bg-dark'>
                <Link to="/" className="logo_header d-flex align-items-center mb-md-0 me-md-auto text-white text-decoration-none">
                    <img src={logo} height={30} alt="Logo" />
                </Link>
                <button className="btn btn-primary menu-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <svg width="25px" height="25px" strokeWidth="2.2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M3 5h18M3 12h18M3 19h18" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </button>
            </div>
        </div>
    );
}

export default Header;
