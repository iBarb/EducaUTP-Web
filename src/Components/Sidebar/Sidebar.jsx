import React, { useEffect, useState } from 'react';
import './Sidebar.css'
import nombre_logo from "../../assets/nombre_logo.svg";
import icono_logo from "../../assets/icono_logo.svg";
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const Sidebar = () => {
    const { logOut } = useAuth()
    const [Collapse, setCollapse] = useState(true);

    useEffect(() => {
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))

        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl, {
                container: document.querySelector('.nav') // establecer el valor del atributo 'data-bs-container' al elemento activador
            })
        })

    }, []);


    return (
        <div className={`position-relative ${Collapse ? "collapsed" : ""}`}>
            <button className='btn-collapse' onClick={() => setCollapse(!Collapse)} >
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className={`sidebar d-flex flex-column flex-shrink-0 text-dark bg-dark h-100 scrollarea `} >
                <Link to="/" className="logo_header d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none centrar">
                    <img src={icono_logo} height={35} alt="Logo" />
                    <img className='logo_nombre' src={nombre_logo} height={35} alt="Logo" />
                </Link>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto gap-2">
                    <li className="nav-item">
                        <NavLink to="/asesoria/buscar" className="nav-link" aria-current="page" title="Buscar asesoria" data-bs-toggle="tooltip" data-bs-placement="right">
                            <i className="fa-solid fa-calendar-days"></i>
                            <label>Buscar asesoria</label>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/asesoria/brindar" className="nav-link" aria-current="page" title="Brindar asesoria" data-bs-toggle="tooltip" data-bs-placement="right">
                            <i className="fa-solid fa-book"></i>
                            <label>Brindar asesoria</label>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/asesoria/historial" className="nav-link" aria-current="page" title="Historial asesoria" data-bs-toggle="tooltip" data-bs-placement="right">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <label>Historial asesoria</label>
                        </NavLink>
                    </li>
                </ul>
                <hr />
                <div className="dropdown">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                        <strong>mdo</strong>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark text-small shadow ">
                        {/* <li><a className="dropdown-item" href="#">New project...</a></li>
                        <li><a className="dropdown-item" href="#">Settings</a></li>
                        <li><a className="dropdown-item" href="#">Profile</a></li>
                        <li><hr className="dropdown-divider" /></li> */}
                        <li><button onClick={() => logOut()} className="dropdown-item"><i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión</button></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
