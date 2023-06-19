import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, useAuth } from '../../../Auth/AuthContext';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-dt/js/dataTables.dataTables';
import './UsersList.css'
import Table from '../../../Components/Table/Table';
import Modal from '../../../Components/Modal/Modal';

const UsersList = () => {
    const { alerta } = useAuth()
    const [Datos, setDatos] = useState([]);
    const [ToggleModal, setToggleModal] = useState(false);
    const [SelectUser, setSelectUser] = useState({});

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

    return (
        <div className='h-100-sm w-100 d-flex flex-column overflow-hidden'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Lista Usuarios</h1>
            <div className='content-dashboard'>
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
                        <button
                            className='btn btn-primary'
                            onClick={async (e) => {
                                e.target.disabled = true
                                // Actualizar el rol del usuario
                                await updateDoc(doc(db, "usuarios", SelectUser.uid), {
                                    rol: SelectUser.rol,
                                    nombre: SelectUser.nombre

                                }).then(() => {
                                    alerta("success", "Se actualizó el usuario")
                                    setToggleModal(false)
                                });
                            }}
                        >
                            Guardar
                        </button>
                    }
                >
                    <div class="row">
                        <div class="col-12 col-sm-6 mt-3">
                            <label for="name" class="form-label">Nombre</label>
                            <input
                                type="text"
                                id='nombre'
                                name='nombre'
                                class="form-control"
                                placeholder="Nombre"
                                onChange={handleChange}
                                value={SelectUser.nombre}
                            />
                        </div>
                        <div class="col-12 col-sm-6 mt-3">
                            <label for="rol" class="form-label">Rol</label>
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
                        <div class="col-12 col-sm-6 mt-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="text" id='email' class="form-control" placeholder="Email" value={SelectUser.email} disabled />
                        </div>
                        <div class="col-12 col-sm-6 mt-3">
                            <label for="uid" class="form-label">Uid</label>
                            <input type="text" id='uid' class="form-control" placeholder="Email" value={SelectUser.uid} disabled />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default UsersList;
