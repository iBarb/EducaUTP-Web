import React from 'react';
import logo from "../../assets/logo.svg";
import './Loader.css'

const Loader = () => {
    return (
        <div className='w-100 h-100 bg-dark fixed-top d-flex justify-content-center align-items-center loader'>
            <img width={200} src={logo} alt="logo EducaUTP" />
        </div>
    );
}

export default Loader;
