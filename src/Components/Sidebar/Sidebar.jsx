import React, { useEffect, useState } from 'react';
import './Sidebar.css'
import nombre_logo from "../../assets/nombre_logo.svg";
import icono_logo from "../../assets/icono_logo.svg";
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const links = [
    { id: 1, name: 'Asesorias', icon: 'fa-solid fa-calendar-days', path: '/asesoria/buscar', access: ['alumno', 'tutor'] },
    { id: 2, name: 'Mis asesorias', icon: 'fa-solid fa-book', path: '/asesoria/brindar', access: ['tutor'] },
    { id: 3, name: 'Historial asesorias', icon: 'fa-solid fa-magnifying-glass', path: '/asesoria/historial', access: ['alumno', 'tutor'] },
    { id: 4, name: 'Usuarios', icon: 'fa-solid fa-users', path: '/lista/usuarios', access: ['admin'] },
    { id: 5, name: 'Asesorias', icon: 'fa-solid fa-chalkboard-user', path: 'lista/asesorias', access: ['admin'] },
    { id: 6, name: 'Ciclos', icon: 'fa-solid fa-calendar-days', path: 'lista/ciclos', access: ['admin'] },
    { id: 7, name: 'Aulas', icon: 'fas fa-chalkboard', path: 'lista/aulas', access: ['admin'] },
    { id: 8, name: 'Cursos', icon: 'fas fa-book', path: 'lista/cursos', access: ['admin'] }
]

const Sidebar = () => {
    const { logOut, currentUser } = useAuth()
    const [Collapse, setCollapse] = useState(true);

    useEffect(() => {
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))

        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl, {
                container: document.querySelector('.nav'), // establecer el valor del atributo 'data-bs-container' al elemento activador
                trigger: 'hover' // Aparecerá el tooltip cuando se haga "hover" (sobre)
            })
        })
    }, []);



    return (
        <div className={`offcanvas offcanvas-start position-relative-sm ${Collapse ? "collapsed" : ""}`} tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            <button className='btn-collapse d-none d-md-block' onClick={() => setCollapse(!Collapse)} >
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className={`sidebar d-flex flex-column flex-shrink-0 text-dark bg-dark h-100 scrollarea `} >
                <Link to="/" className="logo_header d-flex align-items-center mb-md-0 me-md-auto text-white text-decoration-none">
                    <img src={icono_logo} height={35} alt="Logo" />
                    <img className='logo_nombre' src={nombre_logo} height={35} alt="Logo" />
                </Link>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto gap-2">
                    {links.map((link) => {
                        if (link.access.includes(currentUser.rol)) {
                            return (
                                <li className="nav-item" key={link.id}>
                                    <NavLink
                                        to={link.path}
                                        className="nav-link"
                                        aria-current="page"
                                        title={link.name}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="right"
                                    >
                                        <i className={link.icon}></i>
                                        <label>{link.name}</label>
                                    </NavLink>
                                </li>
                            );
                        }
                    })}
                </ul>
                <hr />
                <div className="dropdown">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="https://media.discordapp.net/attachments/866837932907954229/1113654665230430278/user-img.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                        <strong className='text-truncate'>{currentUser.nombre}</strong>
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
