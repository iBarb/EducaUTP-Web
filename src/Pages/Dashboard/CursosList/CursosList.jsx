import React, { useEffect, useState } from 'react';
import Table from '../../../Components/Table/Table';
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, useAuth } from '../../../Auth/AuthContext';
import Modal from '../../../Components/Modal/Modal';
import Swal from 'sweetalert2';

const CursosList = () => {
    const { alerta } = useAuth()
    const [Datos, setDatos] = useState([]);
    const [DatosEnvio, setDatosEnvio] = useState({});
    const [ToggleModal, setToggleModal] = useState(false);
    const [ToggleModal2, setToggleModal2] = useState(false);
    const [SelectedCurso, setSelectedCurso] = useState({});

    useEffect(() => {
        let cursosRef = collection(db, "cursos");

        const unsubscribe = onSnapshot(cursosRef, async (querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({
                    id: doc.id,
                    nombre: doc.data().nombre,
                });
            });
            setDatos(docs)
        });


        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.target.disabled = true
        addDoc(collection(db, "cursos"), {
            nombre: DatosEnvio.nombre,
        }).then(() => {
            alerta("success", "Se agrego el Curso")
            setToggleModal(false);
        }).catch((error) => {
            e.target.disabled = false
        })
    }

    const handleChange = (e) => {
        let name = e.target.name
        let value = e.target.value
        setDatosEnvio((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };
    const handleChange2 = (e) => {
        let name = e.target.name
        let value = e.target.value
        setSelectedCurso((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };


    const handleDelete = async (e) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el Curso',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                e.target.disabled = true;

                try {

                    await Promise.all([
                        deleteDoc(doc(db, 'cursos', SelectedCurso.id)),
                    ]);

                    Swal.fire('Eliminado', 'Se ha eliminado el Curso', 'success');
                    setToggleModal2(false);
                    e.target.disabled = false;
                } catch (error) {
                    e.target.disabled = false;
                    console.log(error);
                    Swal.fire('Error', 'Ocurrió un error al eliminar el Curso', 'error');
                }
            }
        });
    };

    const handleEdit = async (e) => {
        e.target.disabled = true;

        try {
            updateDoc(doc(db, 'cursos', SelectedCurso.id), {
                nombre: SelectedCurso.nombre,
            })

           alerta('success', 'Se editó el Curso');
            setToggleModal2(false);
            e.target.disabled = false;
        }
        catch (error) {
            e.target.disabled = false;
            console.log(error);
            alerta('error', 'Ocurrió un error al editar el Curso');
        }
    };

    return (
        <div className='h-100-sm w-100 d-flex flex-column overflow-hidden'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Lista Cursos</h1>
            <div className='content-dashboard'>
                <div className='py-3'>
                    <button
                        className='btn btn-sm btn-success'
                        onClick={() => {
                            setToggleModal(true);
                            setDatosEnvio({
                                nombre: "",
                                anno: "",
                                inicio: "",
                                fin: ""
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
                        </tr>
                    </thead>
                    <tbody>
                        {Datos.map((dato, index) => {
                            return (
                                <tr key={dato.id} onClick={() => { setToggleModal2(true); setSelectedCurso(dato) }}>
                                    <th>{index + 1}</th>
                                    <td>{dato.nombre}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>

                <Modal
                    isOpen={ToggleModal} // Estado de apertura del modal
                    ToggleModal={setToggleModal} // Función para cambiar el estado del modal
                    title={'Agregar cursos'} // Título del modal
                    footer={<button
                        className='btn btn-primary'
                        onClick={handleSubmit}
                    >
                        Guardar
                    </button>
                    }
                >
                    <div className='row'>
                        <div className="col-12">
                            <label htmlFor="nombre" className="form-label">Nombre: </label>
                            <input
                                type="text"
                                id='nombre'
                                name='nombre'
                                className='form-control'
                                onChange={handleChange}
                                value={DatosEnvio.nombre}
                            />
                        </div>
                    </div>
                </Modal>


                <Modal
                    isOpen={ToggleModal2} // Estado de apertura del modal
                    ToggleModal={setToggleModal2} // Función para cambiar el estado del modal
                    title={'Editar cursos'} // Título del modal
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
                            onClick={handleEdit}
                        >
                            Editar
                        </button>
                        
                        </>
                    }
                >
                    <div className='row'>
                        <div className="col-12 ">
                            <label htmlFor="nombre" className="form-label">Nombre:</label>
                            <input
                                type="text"
                                id='nombre'
                                name='nombre'
                                className='form-control'
                                onChange={handleChange2}
                                value={SelectedCurso.nombre}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default CursosList;
