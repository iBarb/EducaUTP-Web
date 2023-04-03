import React, { useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import Swal from 'sweetalert2';
import FirebaseApp from './FirebaseApp';
import Loader from '../Components/Loader/Loader';


//sweet options
const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})



const auth = getAuth(FirebaseApp);




const AuthContext = React.createContext(null);

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setloading] = useState(false);


    function login(email, password) {
        Toast.fire({
            icon: 'success',
            title: 'Inicio de sesión correcto'
        })
        setCurrentUser(true)
    }

    function logOut() {
        signOut(auth)
            .then(() => {
                setCurrentUser(null)
                Toast.fire({
                    icon: 'info',
                    title: 'La sesión se cerró'
                })
                setCurrentUser(false)
            }).catch((error) => {
                Toast.fire({
                    icon: 'error',
                    title: 'Oops... Algo salió mal'
                })
            });
    }

    useEffect(() => {
        setloading(true)
        onAuthStateChanged(auth, (user) => {
            try {
                if (user) {
                    console.log(user);
                } else {
                    console.log("no hay sesion");
                }
                setloading(false)
            } catch (error) {
                console.log("error");
                setloading(false)
            }
        });
    }, []);



    const value = {
        currentUser,
        login,
        logOut
    }

    return (
        <AuthContext.Provider value={value}>
            {loading && <Loader />}
            {children}
        </AuthContext.Provider>
    )
}