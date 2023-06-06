import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';


const PrivateRouter = ({ element , flagAdmin, flagTutor, flagAlumno}) => {
    const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  } else if (flagAdmin && currentUser.rol === 'admin') {
    return element;
  } else if (flagTutor && currentUser.rol === 'tutor') {
    return element;
  } else if (flagAlumno && currentUser.rol === 'alumno') {
    return element;
  } else if (!flagAdmin && !flagTutor && !flagAlumno) {
    return element;
  } else {
    return window.history.length > 1 ? navigate(-1) : navigate('/');
  }
}

export default PrivateRouter;