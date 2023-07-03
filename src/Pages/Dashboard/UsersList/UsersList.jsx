import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { auth, db, useAuth } from '../../../Auth/AuthContext';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-dt/js/dataTables.dataTables';
import './UsersList.css'
import Table from '../../../Components/Table/Table';
import Modal from '../../../Components/Modal/Modal';
import Swal from 'sweetalert2';
import { createUserWithEmailAndPassword, deleteUser, getAuth } from 'firebase/auth';


const UsersList = () => {
    const { alerta } = useAuth();
    const [Datos, setDatos] = useState([]);
    const [ToggleModal, setToggleModal] = useState(false);
    const [ToggleModal2, setToggleModal2] = useState(false);
    const [SelectUser, setSelectUser] = useState({});
    const [DatosEnvio, setDatosEnvio] = useState({})

    useEffect(() => {
        let usuariosRef = collection(db, "usuarios");

        const unsubscribe = onSnapshot(usuariosRef, async (querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ ...doc.data(), id: doc.id });
            });
            setDatos(docs)
        });


        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        let name = e.target.name
        let value = e.target.value
        setSelectUser((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };
    const handleChange2 = (e) => {
        let name = e.target.name
        let value = e.target.value
        setDatosEnvio((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleUpdate = async (e) => {
        e.target.disabled = true
        // Actualizar el rol del usuario
        await updateDoc(doc(db, "usuarios", SelectUser.uid), {
            rol: SelectUser.rol,
            nombre: SelectUser.nombre

        }).then(() => {
            alerta("success", "Se actualizó el usuario")
            setToggleModal(false)
        });
    }

    const handleDelete = async (e) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el usuario',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                e.target.disabled = true;

                try {

                    await Promise.all([
                        deleteDoc(doc(db, 'usuarios', SelectUser.uid)),
                    ]);

                    Swal.fire('Eliminado', 'Se ha eliminado el usuario', 'success');
                    setToggleModal(false);
                    e.target.disabled = false;
                } catch (error) {
                    e.target.disabled = false;
                    console.log(error);
                    Swal.fire('Error', 'Ocurrió un error al eliminar el usuario', 'error');
                }
            }
        });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        e.target.disabled = true;

        let errors = {
            "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
            "auth/email-already-in-use": "El correo electrónico ya existe",
            "auth/network-request-failed": "Error en la conexión"
        };

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, DatosEnvio.email, DatosEnvio.password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, "usuarios", uid), {
                nombre: DatosEnvio.nombre,
                email: DatosEnvio.email,
                rol: DatosEnvio.rol,
                uid: uid,
            });

            alerta('success', 'Usuario creado correctamente');
            // Puedes realizar acciones adicionales aquí para mantener al usuario dentro de la aplicación
        } catch (error) {
            console.log(error);
            e.target.disabled = false;
            alerta('error', errors[error.code]);
        }
    };

    return (
        <div className='h-100-sm w-100 d-flex flex-column overflow-hidden'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Lista Usuarios</h1>
            <div className='content-dashboard'>
                <div className='py-3'>
                    <button
                        className='btn btn-sm btn-success'
                        onClick={() => {
                            setToggleModal2(true);
                            setDatosEnvio({
                                nombre: '',
                                email: '',
                                password: '',
                                rol: '',
                            })
                        }}
                    >
                        <i className="fa-solid fa-plus"></i> Agregar
                    </button>
                </div>
                <Table Datos={Datos}>
                    <thead className='border-bottom border-dark border-2 border-opacity-25'>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nombres</th>
                            <th scope="col">E-mail</th>
                            <th scope="col">Rol</th>
                            <th scope="col">Uid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Datos.map((dato, index) => {
                            return (
                                <tr key={dato.id} onClick={() => { setToggleModal(true); setSelectUser(dato) }}>
                                    <th>{index + 1}</th>
                                    <td>{dato.nombre}</td>
                                    <td>{dato.email}</td>
                                    <td>{dato.rol}</td>
                                    <td>{dato.uid}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
                <Modal
                    isOpen={ToggleModal} // Estado de apertura del modal
                    ToggleModal={setToggleModal} // Función para cambiar el estado del modal
                    title={'Usuario'} // Título del modal
                    footer={
                        <>
                            <button
                                className='btn btn-primary'
                                onClick={handleDelete}
                            >
                                Eliminar
                            </button>
                            <button
                                className='btn btn-success'
                                onClick={handleUpdate}
                            >
                                Editar
                            </button>
                        </>
                    }
                >
                    <div className="row">
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="name" className="form-label">Nombre</label>
                            <input
                                type="text"
                                id='nombre'
                                name='nombre'
                                className="form-control"
                                placeholder="Nombre"
                                onChange={handleChange}
                                value={SelectUser.nombre}
                            />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="rol" className="form-label">Rol</label>
                            <select
                                id='rol'
                                name='rol'
                                className='form-select'
                                defaultValue={SelectUser.rol} // Valor seleccionado del select
                                onChange={handleChange}
                            >
                                <option value="admin">Admin</option>
                                <option value="alumno">Alumno</option>
                                <option value="tutor">Tutor</option>
                            </select>

                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" id='email' className="form-control" placeholder="Email" value={SelectUser.email} disabled />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="uid" className="form-label">Uid</label>
                            <input type="text" id='uid' className="form-control" placeholder="Email" value={SelectUser.uid} disabled />
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={ToggleModal2} // Estado de apertura del modal
                    ToggleModal={setToggleModal2} // Función para cambiar el estado del modal
                    title={'Agregar Usuario'} // Título del modal
                    footer={
                        <>
                            <button
                                className='btn btn-success'
                                onClick={handleAdd}
                            >
                                Guardar
                            </button>
                        </>
                    }
                >
                    <div className="row">
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="name" className="form-label">Nombre</label>
                            <input
                                type="text"
                                id='nombre'
                                name='nombre'
                                className="form-control"
                                placeholder="Nombre completo"
                                onChange={handleChange2}
                                value={DatosEnvio.nombre}
                            />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="rol" className="form-label">Rol</label>
                            <select
                                id='rol'
                                name='rol'
                                className='form-select'
                                defaultValue={DatosEnvio.rol} // Valor seleccionado del select
                                onChange={handleChange2}
                            >
                                <option disabled value="">Selecciona un rol</option>
                                <option value="admin">Admin</option>
                                <option value="alumno">Alumno</option>
                                <option value="tutor">Tutor</option>
                            </select>

                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="text" id='email' name='email' className="form-control" placeholder="Correo institucional" onChange={handleChange2} value={DatosEnvio.email} />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input type="text" id='password' name='password' className="form-control" placeholder="Contraseña" onChange={handleChange2} value={DatosEnvio.password} />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default UsersList;
