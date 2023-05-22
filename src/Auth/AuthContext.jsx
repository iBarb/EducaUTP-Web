import React, { useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDocs, setDoc, collection, addDoc, updateDoc } from "firebase/firestore";
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
const db = getFirestore(FirebaseApp);




const AuthContext = React.createContext(null);

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setloading] = useState(false);




    function SignUp(nombres, email, password) {
        setloading(true)
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const uid = userCredential.user.uid;
                Toast.fire({
                    icon: 'success',
                    title: 'Inicio de sesión correcto'
                })

                //agregar datos del usuario
                setDoc(doc(db, "usuarios", uid), {
                    nombre: nombres,
                    email: email,
                    rol: "alumno",
                    uid: uid,
                });


            }).catch((error) => {
                // ..
                setloading(null)
            });

    }

    function login(email, password) {
        let errors = {
            "auth/too-many-requests": "La cuenta fue bloqueada, intente mas tarde",
            "auth/user-not-found": "El correo electronico no existe",
            "auth/wrong-password": "La contraseña es incorrecta"
        }
        setloading(true)
        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then(async (data) => {

                    let datos = await fetchDatosUser(data.user.uid);
                    setCurrentUser(datos);
                    Toast.fire({
                        icon: 'success',
                        title: 'Inicio de sesión correcto'
                    })
                })
                .catch((error) => {
                    Toast.fire({
                        icon: 'error',
                        title: errors[error.code]
                    })

                    setloading(false)

                });
        } else {
            Toast.fire({
                icon: 'error',
                title: 'Todos los campos son obligatorios'
            })
            setloading(false)
        }
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

    async function fetchDatosUser(uid) {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        let datos = null;
        querySnapshot.forEach((doc) => {
            if (uid === doc.data().uid) {
                datos = doc.data();
            }
        });
        return datos;
    }

    useEffect(() => {
        setloading(true);
        const unsuscribe = onAuthStateChanged(auth, async (user) => {
            try {
                const uid = user.uid;
                if (uid === user.uid) {
                    let datos = await fetchDatosUser(uid);
                    setCurrentUser(datos);
                    setloading(null);

                } else {
                    setCurrentUser(null);
                    setloading(null);
                }
            } catch (error) {
                setCurrentUser(null);
                setloading(null);
            }
        });

        return unsuscribe;
    }, []);

    function resetPassword(email) {
        sendPasswordResetEmail(auth, email)
            .then((e) => {
                console.log(e);
                Toast.fire({
                    icon: 'success',
                    title: 'Se envió un correo para restablecer la contraseña'
                })
            })
            .catch((error) => {
                Toast.fire({
                    icon: 'error',
                    title: 'Oops... Algo salió mal'
                })
            });
    }


    const value = {
        currentUser,
        login,
        logOut,
        SignUp,
        resetPassword

    }

    return (
        <AuthContext.Provider value={value}>
            {loading && <Loader />}
            {children}
        </AuthContext.Provider>
    )
}