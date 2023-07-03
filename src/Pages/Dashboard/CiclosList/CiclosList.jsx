import React, { useEffect, useState } from 'react';
import Table from '../../../Components/Table/Table';
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, useAuth } from '../../../Auth/AuthContext';
import Modal from '../../../Components/Modal/Modal';
import Swal from 'sweetalert2';
import { obtenerFechaEnFormato, obtenerFechaEnFormatoEnvio } from '../../../Functions/Funciones';

const CiclosList = () => {
    const { alerta } = useAuth()
    const [Datos, setDatos] = useState([]);
    const [DatosEnvio, setDatosEnvio] = useState({});
    const [ToggleModal, setToggleModal] = useState(false);
    const [ToggleModal2, setToggleModal2] = useState(false);
    const [SelectedCiclo, setSelectedCiclo] = useState({});

    useEffect(() => {
        let ciclosRef = collection(db, "ciclos");

        const unsubscribe = onSnapshot(ciclosRef, async (querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({
                    id: doc.id,
                    nombre: doc.data().nombre,
                    anno: doc.data().anno,
                    fin: doc.data().fin,
                    inicio: doc.data().inicio,
                });
            });
            console.log(docs);
            setDatos(docs)
        });


        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.target.disabled = true
        addDoc(collection(db, "ciclos"), {
            nombre: DatosEnvio.nombre,
            anno: DatosEnvio.anno,
            inicio: new Date(DatosEnvio.inicio),
            fin: new Date(DatosEnvio.fin),
        }).then(() => {
            alerta("success", "Se agrego el ciclo")
            setToggleModal(false);
        }).ca
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
        setSelectedCiclo((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };


    const handleDelete = async (e) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el Ciclo',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                e.target.disabled = true;

                try {

                    await Promise.all([
                        deleteDoc(doc(db, 'ciclos', SelectedCiclo.id)),
                    ]);

                    Swal.fire('Eliminado', 'Se ha eliminado el Ciclo', 'success');
                    setToggleModal2(false);
                    e.target.disabled = false;
                } catch (error) {
                    e.target.disabled = false;
                    console.log(error);
                    Swal.fire('Error', 'Ocurrió un error al eliminar el Ciclo', 'error');
                }
            }
        });
    };

    const handleEdit = async (e) => {
        e.target.disabled = true;

        try {
            updateDoc(doc(db, 'ciclos', SelectedCiclo.id), {
                nombre: SelectedCiclo.nombre,
                anno: SelectedCiclo.anno,
                inicio: SelectedCiclo.inicio.seconds ? new Date(`${obtenerFechaEnFormatoEnvio(SelectedCiclo.inicio)}T00:00:00.000`): new Date(`${SelectedCiclo.inicio}T00:00:00.000`),
                fin: SelectedCiclo.fin.seconds ? new Date(`${obtenerFechaEnFormatoEnvio(SelectedCiclo.fin)}T00:00:00.000`) :new Date(`${SelectedCiclo.fin}T00:00:00.000`),
            })

           alerta('success', 'Se editó el Ciclo');
            setToggleModal2(false);
            e.target.disabled = false;
        }
        catch (error) {
            e.target.disabled = false;
            console.log(error);
            alerta('error', 'Ocurrió un error al editar el Ciclo');
        }
    };

    return (
        <div className='h-100-sm w-100 d-flex flex-column overflow-hidden'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Lista Ciclos</h1>
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
                            <th scope="col">Año</th>
                            <th scope="col">Inicio</th>
                            <th scope="col">Fin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Datos.map((dato, index) => {
                            return (
                                <tr key={dato.id} onClick={() => { setToggleModal2(true); setSelectedCiclo(dato) }}>
                                    <th>{index + 1}</th>
                                    <td>{dato.nombre}</td>
                                    <td>{dato.anno}</td>
                                    <td>{obtenerFechaEnFormato(dato.inicio)}</td>
                                    <td>{obtenerFechaEnFormato(dato.fin)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>

                <Modal
                    isOpen={ToggleModal} // Estado de apertura del modal
                    ToggleModal={setToggleModal} // Función para cambiar el estado del modal
                    title={'Agregar ciclos'} // Título del modal
                    footer={<button
                        className='btn btn-primary'
                        onClick={handleSubmit}
                    >
                        Guardar
                    </button>
                    }
                >
                    <div className='row'>
                        <div className="col-12 col-sm-6">
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
                        <div className="col-12 col-sm-6">
                            <label htmlFor="anno" className="form-label">Año: </label>
                            <input
                                type="text"
                                id='anno'
                                name='anno'
                                className='form-control'
                                onChange={handleChange}
                                value={DatosEnvio.anno}
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label htmlFor="inicio" className="form-label">Inicio: </label>
                            <input
                                type="date"
                                id='inicio'
                                name='inicio'
                                className='form-control'
                                onChange={handleChange}
                                value={DatosEnvio.inicio}
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label htmlFor="fin" className="form-label">Fin: </label>
                            <input
                                type="date"
                                id='fin'
                                name='fin'
                                className='form-control'
                                onChange={handleChange}
                                value={DatosEnvio.fin}
                            />
                        </div>
                    </div>
                </Modal>


                <Modal
                    isOpen={ToggleModal2} // Estado de apertura del modal
                    ToggleModal={setToggleModal2} // Función para cambiar el estado del modal
                    title={'Editar ciclos'} // Título del modal
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
                        <div className="col-12 col-sm-6">
                            <label htmlFor="nombre" className="form-label">Nombre: </label>
                            <input
                                type="text"
                                id='nombre'
                                name='nombre'
                                className='form-control'
                                onChange={handleChange2}
                                value={SelectedCiclo.nombre}
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label htmlFor="anno" className="form-label">Año: </label>
                            <input
                                type="text"
                                id='anno'
                                name='anno'
                                className='form-control'
                                onChange={handleChange2}
                                value={SelectedCiclo.anno}
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label htmlFor="inicio" className="form-label">Inicio: </label>
                            <input
                                type="date"
                                id='inicio'
                                name='inicio'
                                className='form-control'
                                onChange={handleChange2}
                                value={SelectedCiclo.inicio ? SelectedCiclo.inicio.seconds ? obtenerFechaEnFormatoEnvio(SelectedCiclo.inicio) : SelectedCiclo.inicio : ''}
                            />
                        </div>
                        <div className="col-12 col-sm-6">
                            <label htmlFor="fin" className="form-label">Fin: </label>
                            <input
                                type="date"
                                id='fin'
                                name='fin'
                                className='form-control'
                                onChange={handleChange2}
                                value={SelectedCiclo.inicio ? SelectedCiclo.fin.seconds ? obtenerFechaEnFormatoEnvio(SelectedCiclo.fin) : SelectedCiclo.fin : ''}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default CiclosList;
