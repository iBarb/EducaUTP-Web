import React from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Login from '../Pages/Login/login';
import Inicio from '../Pages/Dashboard/Inicio/inicio';
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';
import DarAsesoria from '../Pages/Dashboard/DarAsesoria/DarAsesoria';
import RecibirAsesoria from '../Pages/Dashboard/RecibirAsesoria/RecibirAsesoria';
import HistorialAsesoria from '../Pages/Dashboard/HistorialAsesoria/HistorialAsesoria';
import Register from '../Pages/Register/register';
import ForgotPassword from '../Pages/ForgotPassword/ForgotPassword';


const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRouter element={<Inicio />} />,
        children: [
            {
                path: "asesoria/buscar",
                element: <PrivateRouter flagAlumno={true} flagTutor={true} element={<RecibirAsesoria />}/>
            },
            {
                path: "asesoria/brindar",
                element: <PrivateRouter flagTutor={true} element={<DarAsesoria />}/>
            }
            ,
            {
                path: "asesoria/historial",
                element: <PrivateRouter flagAlumno={true} flagTutor={true} element={<HistorialAsesoria />}/>
            }
        ]
    },
    {
        path: "/login",
        element: <PublicRouter element={<Login />} />,
    },
    {
        path: "/registro",
        element: <PublicRouter element={<Register />} />,
    },
    {
        path: "/forgot/password",
        element: <PublicRouter element={<ForgotPassword />} />,
    },
    
]);



const AppRouter = () => {
    return (
        <RouterProvider router={router} />
    );
}

export default AppRouter;
