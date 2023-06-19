import React, { useEffect, useState } from 'react';
import Table from '../../../Components/Table/Table';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, useAuth } from '../../../Auth/AuthContext';
import { obtenerFechaEnFormato, obtenerFechaEnFormatoEnvio } from '../../../Functions/Funciones';
import Modal from '../../../Components/Modal/Modal';

const CiclosList = () => {
    const { alerta } = useAuth()
    const [Datos, setDatos] = useState([]);
    const [DatosEnvio, setDatosEnvio] = useState({});
    const [ToggleModal, setToggleModal] = useState(false);

    useEffect(() => {
        let ciclosRef = collection(db, "ciclos");

        const unsubscribe = onSnapshot(ciclosRef, async (querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({
                    id: doc.id,
                    nombre: doc.data().nombre,
                    anno: doc.data().anno,
                    fin: obtenerFechaEnFormato(doc.data().fin),
                    inicio: obtenerFechaEnFormato(doc.data().inicio),
                });
            });
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

    return (
        <div className='h-100-sm w-100 d-flex flex-column overflow-hidden'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Lista Asesorias</h1>
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
                                <tr key={dato.id} >
                                    <th>{index + 1}</th>
                                    <td>{dato.nombre}</td>
                                    <td>{dato.anno}</td>
                                    <td>{dato.inicio}</td>
                                    <td>{dato.fin}</td>
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
                            <label htmlFor="nombre" className="form-label">Nombre: <span className='text-muted'>(Opcional)</span></label>
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
                            <label htmlFor="anno" className="form-label">Año: <span className='text-muted'>(Opcional)</span></label>
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
            </div>
        </div>
    );
}

export default CiclosList;
