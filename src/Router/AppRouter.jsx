import React from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Login from '../Pages/Login/login';
import Register from '../Pages/Register/Register';
import Inicio from '../Pages/Dashboard/Inicio/inicio';
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';
import DarAsesoria from '../Pages/Dashboard/DarAsesoria/DarAsesoria';
import RecibirAsesoria from '../Pages/Dashboard/RecibirAsesoria/RecibirAsesoria';
import HistorialAsesoria from '../Pages/Dashboard/HistorialAsesoria/HistorialAsesoria';


const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRouter element={<Inicio />} />,
        children: [
            {
                path: "asesoria/buscar",
                element: <RecibirAsesoria />
            },
            {
                path: "asesoria/brindar",
                element: <DarAsesoria />
            }
            ,
            {
                path: "asesoria/historial",
                element: <HistorialAsesoria />
            }
        ]
    },
    {
        path: "/login",
        element: <PublicRouter element={<Login />} />,
    },
    {
        path: "/register",
        element: <PublicRouter element={<Register />} />,
    },
]);



const AppRouter = () => {
    return (
        <RouterProvider router={router} />
    );
}

export default AppRouter;
