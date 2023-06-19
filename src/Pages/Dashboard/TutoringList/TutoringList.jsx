import React, { useEffect, useState } from 'react';
import Table from '../../../Components/Table/Table';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db, useAuth } from '../../../Auth/AuthContext';
import Modal from '../../../Components/Modal/Modal';
import HoraSelect from '../../../Components/HoraSelect/HoraSelect';
import { obtenerFechaEnFormato, obtenerFechaEnFormatoEnvio } from '../../../Functions/Funciones';

const TutoringList = () => {
    const { alerta } = useAuth()
    const [Datos, setDatos] = useState([]);
    const [DatosFiltrados, setDatosFiltrados] = useState([]);
    const [DatosAgrupados, setDatosAgrupados] = useState([]);
    const [DatosEnvio, setDatosEnvio] = useState({
        ciclo: "",
        tutor: "",
        inicio: "",
        fin: "",
        hora: "",
        sede: "",
        curso: "",
        aula: "",
        dias: [],
    });
    const [Ciclos, setCiclos] = useState([]);
    const [Tutores, setTutores] = useState([]);
    const [Sedes, setSedes] = useState([]);
    const [Cursos, setCursos] = useState([]);
    const [Aulas, setAulas] = useState([]);
    const [ToggleModal, setToggleModal] = useState(false);
    const [ToggleModal2, setToggleModal2] = useState(false);

    useEffect(() => {
        const getCiclos = async () => {
            try {
                const ciclosRef = collection(db, "ciclos");
                const querySnapshot = await getDocs(ciclosRef);
                const docs = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                console.log(docs);
                setCiclos(docs);
            } catch (error) {
                console.error("Error al obtener los ciclos:", error);
            }
        };
        const getSedes = async () => {
            try {
                const sedesRef = collection(db, "sedes");
                const querySnapshot = await getDocs(sedesRef);
                const docs = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setSedes(docs);
            } catch (error) {
                console.error("Error al obtener los sedes:", error);
            }
        };
        const getCursos = async () => {
            try {
                const cursosRef = collection(db, "cursos");
                const querySnapshot = await getDocs(cursosRef);
                const docs = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setCursos(docs);
            } catch (error) {
                console.error("Error al obtener los Cursos:", error);
            }
        };
        const getAulas = async () => {
            try {
                const aulasRef = collection(db, "aulas");
                const querySnapshot = await getDocs(aulasRef);
                const docs = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setAulas(docs);
            } catch (error) {
                console.error("Error al obtener los Aulas:", error);
            }
        };

        const getTutores = async () => {
            try {
                const q = query(collection(db, "usuarios"), where("rol", "==", "tutor"));
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setTutores(docs);
            } catch (error) {
                console.log(error);
            }
        }
        getTutores();
        getCiclos();
        getSedes();
        getCursos();
        getAulas();
    }, []);

    useEffect(() => {
        // Obtener una referencia a la colección "asesorias" en la base de datos
        let asesoriasRef = collection(db, "asesorias");

        // Establecer un listener para obtener los datos de la colección "asesorias" en tiempo real
        const unsubscribe = onSnapshot(asesoriasRef, async (querySnapshot) => {
            // Obtener los documentos de la colección "asesorias"
            const datos = await Promise.all(
                querySnapshot.docs.map(async (asesoriaDoc) => {
                    const asesoriaData = asesoriaDoc.data();

                    // Obtener datos adicionales de otros documentos relacionados
                    const promises = [
                        getDoc(doc(db, "usuarios", asesoriaData.tutor)),
                        getDoc(doc(db, "cursos", asesoriaData.curso)),
                        getDoc(doc(db, "aulas", asesoriaData.aula)),
                        getDoc(doc(db, "sedes", asesoriaData.sede)),
                        getDoc(doc(db, "ciclos", asesoriaData.ciclo))
                    ];

                    // Utiliza Promise.all() para ejecutar varias promesas en paralelo y esperar a que todas se resuelvan antes de continuar.
                    const [tutorDoc, cursoDoc, aulaDoc, sedeDoc, cicloDoc] = await Promise.all(
                        promises
                    );

                    // Crear un objeto con los datos de la asesoría y los datos adicionales
                    return {
                        id: asesoriaDoc.id,
                        tutor_nombre: tutorDoc.data().nombre,
                        curso_nombre: cursoDoc.data().nombre,
                        aula_nombre: aulaDoc.data().nombre,
                        sede_nombre: sedeDoc.data().nombre,
                        ciclo_nombre: cicloDoc.data().anno + " - " + cicloDoc.data().nombre,
                        ...asesoriaData
                    };
                })
            );

            // Agrupar los datos por aula, curso, sede, tutor y ciclo
            const grupos = datos.reduce((grupos, asesoria) => {
                const { aula_nombre, curso_nombre, sede_nombre, tutor_nombre, ciclo_nombre } = asesoria;
                const grupoKey = `${aula_nombre}-${curso_nombre}-${sede_nombre}-${tutor_nombre}-${ciclo_nombre}`;

                if (grupos.hasOwnProperty(grupoKey)) {
                    grupos[grupoKey].cantidad += 1;
                } else {
                    grupos[grupoKey] = {
                        curso_nombre,
                        tutor_nombre,
                        aula_nombre,
                        sede_nombre,
                        ciclo_nombre,
                        cantidad: 1
                    };
                }

                return grupos;
            }, {});

            // Convertir los grupos en un array de objetos
            const gruposArray = Object.values(grupos);
            setDatos(datos);
            setDatosAgrupados(gruposArray);
        });

        // Devolver una función de limpieza para cancelar la suscripción a los cambios en la colección
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        let name = e.target.name
        let value = e.target.value
        setDatosEnvio((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.target.disabled = true

        const fechaInicio = new Date(DatosEnvio.inicio);
        const fechaFinal = new Date(DatosEnvio.fin);

        const milisegundosPorDia = 24 * 60 * 60 * 1000;

        while (fechaInicio <= fechaFinal) {
            const diaSemana = fechaInicio.getDay().toString();

            if (DatosEnvio.dias.includes(diaSemana)) {
                const fecha = fechaInicio.toISOString().split("T")[0];
                let inicio = new Date(`${fecha}T${DatosEnvio.hora}:00`);
                let fin = new Date(`${fecha}T${DatosEnvio.hora}:00`);
                // Aumentar 1 hora en la variable "fin"
                fin.setHours(fin.getHours() + 1);

                addDoc(collection(db, "asesorias"), {
                    alumnos: [],
                    aula: DatosEnvio.aula,
                    ciclo: DatosEnvio.ciclo,
                    curso: DatosEnvio.curso,
                    fin: fin,
                    inicio: inicio,
                    sede: DatosEnvio.sede,
                    tutor: DatosEnvio.tutor
                });
                alerta("success", "Se creo las asesorias")
                setToggleModal(false);
            }

            fechaInicio.setTime(fechaInicio.getTime() + milisegundosPorDia);
        }
    }

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
                                ciclo: "",
                                tutor: "",
                                inicio: "",
                                fin: "",
                                hora: "",
                                sede: "",
                                curso: "",
                                aula: "",
                                dias: [],
                            })
                        }}
                    >
                        <i className="fa-solid fa-plus"></i> Agregar
                    </button>
                </div>
                <Table Datos={DatosAgrupados}>
                    <thead className='border-bottom border-dark border-2 border-opacity-25'>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Curso</th>
                            <th scope="col">Tutor</th>
                            <th scope="col">Aula</th>
                            <th scope="col">Sede</th>
                            <th scope="col">Ciclo</th>
                            <th scope="col">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DatosAgrupados.map((dato, index) => {
                            return (
                                <tr key={index + 1} onClick={() => {
                                    setToggleModal2(true)
                                    setDatosFiltrados(Datos.filter((item) => {
                                        console.log(item.id, dato.id);
                                        return item.aula_nombre === dato.aula_nombre &&
                                            item.curso_nombre === dato.curso_nombre &&
                                            item.sede_nombre === dato.sede_nombre &&
                                            item.tutor_nombre === dato.tutor_nombre &&
                                            item.ciclo_nombre === dato.ciclo_nombre
                                    }))
                                }}>
                                    <th>{index + 1}</th>
                                    <td>{dato.curso_nombre}</td>
                                    <td>{dato.tutor_nombre}</td>
                                    <td>{dato.aula_nombre}</td>
                                    <td>{dato.sede_nombre}</td>
                                    <td>{dato.ciclo_nombre}</td>
                                    <td>{dato.cantidad}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>

                <Modal
                    isOpen={ToggleModal} // Estado de apertura del modal
                    ToggleModal={setToggleModal} // Función para cambiar el estado del modal
                    title={'Agregar asesorias'} // Título del modal
                    footer={<button
                        className='btn btn-primary'
                        onClick={handleSubmit}
                    >
                        Guardar
                    </button>
                    }
                >
                    <p className='text-muted'><i className="fa-solid fa-circle-info"></i> Las asesorías se crearán dentro del ciclo seleccionado o el rango de fechas especificado, en las horas y días elegidos.</p>
                    <div className='row'>
                        <div className="col-12 col-sm-6">
                            <label htmlFor="ciclo" className="form-label">Ciclo:</label>
                            <select
                                type="text"
                                id='ciclo'
                                name='ciclo'
                                className="form-select"
                                onChange={(e) => {
                                    let name = e.target.name
                                    let value = e.target.value
                                    setDatosEnvio((prevValues) => ({
                                        ...prevValues,
                                        [name]: value,
                                        inicio: obtenerFechaEnFormatoEnvio((Ciclos.find(objeto => objeto.id === value)).inicio),
                                        fin: obtenerFechaEnFormatoEnvio((Ciclos.find(objeto => objeto.id === value)).fin),
                                    }));
                                }}
                                value={DatosEnvio.ciclo}
                            >
                                <option value="" disabled>Seleccionar ciclo</option>
                                {Ciclos.map((ciclo, index) => {
                                    return (
                                        <option key={index} value={ciclo.id}>{ciclo.anno} - {ciclo.nombre}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                            <label htmlFor="tutor" className="form-label">Tutor:</label>
                            <select
                                type="text"
                                id='tutor'
                                name='tutor'
                                className="form-select"
                                onChange={handleChange}
                                value={DatosEnvio.tutor}
                            >
                                <option value="" disabled>Seleccione el tutor</option>
                                {Tutores.map((tutor, index) => {
                                    return (
                                        <option key={index} value={tutor.id}>{tutor.nombre}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="inicio" className="form-label">Inicio: <span className='text-muted'>(Opcional)</span></label>
                            <input
                                type="date"
                                id='inicio'
                                name='inicio'
                                className='form-control'
                                onChange={handleChange}
                                value={DatosEnvio.inicio}
                            />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="fin" className="form-label">Fin: <span className='text-muted'>(Opcional)</span></label>
                            <input
                                type="date"
                                id='fin'
                                name='fin'
                                className='form-control'
                                onChange={handleChange}
                                value={DatosEnvio.fin}
                            />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="hora" className="form-label">Hora Inicio:</label>
                            <HoraSelect
                                id='hora'
                                name='hora'
                                className='form-control'
                                min="08:00"
                                max="21:00"
                                step={30}
                                onChange={handleChange}
                                value={DatosEnvio.hora}
                            />
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="sede" className="form-label">Sede:</label>
                            <select
                                type="text"
                                id='sede'
                                name='sede'
                                className="form-select"
                                placeholder="Nombre"
                                onChange={handleChange}
                                value={DatosEnvio.sede}
                            >
                                <option value="" disabled>Seleccione el sede</option>
                                {Sedes.map((tutor, index) => {
                                    return (
                                        <option key={index} value={tutor.id}>{tutor.nombre}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="curso" className="form-label">Curso:</label>
                            <select
                                type="text"
                                id='curso'
                                name='curso'
                                className="form-select"
                                placeholder="Nombre"
                                onChange={handleChange}
                                value={DatosEnvio.curso}
                            >
                                <option value="" disabled>Seleccione el curso</option>
                                {Cursos.map((tutor, index) => {
                                    return (
                                        <option key={index} value={tutor.id}>{tutor.nombre}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 mt-3">
                            <label htmlFor="aula" className="form-label">Aula:</label>
                            <select
                                type="text"
                                id='aula'
                                name='aula'
                                className="form-select"
                                placeholder="Nombre"
                                onChange={handleChange}
                                value={DatosEnvio.aula}
                            >
                                <option value="" disabled>Seleccione el aula</option>
                                {Aulas.map((tutor, index) => {
                                    return (
                                        <option key={index} value={tutor.id}>{tutor.nombre}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="dias" className="form-label">Dias:</label>
                            <div className="row">
                                <div className="form-check col centrar gap-1">
                                    <input className="form-check-input" type="checkbox" id="lunes" name="dias[]" value="0" onChange={(e) => {
                                        const value = e.target.value
                                        const isChecked = e.target.checked;
                                        setDatosEnvio((prevValues) => ({
                                            ...prevValues,
                                            dias: isChecked
                                                ? [...prevValues.dias, value] // Agregar el valor al array
                                                : prevValues.dias.filter((dia) => dia !== value), // Eliminar el valor del array
                                        }));
                                    }} />
                                    <label className="form-check-label" htmlFor="lunes">Lunes</label>
                                </div>

                                <div className="form-check col centrar gap-1">
                                    <input className="form-check-input" type="checkbox" id="martes" name="dias[]" value="1" onChange={(e) => {
                                        const value = e.target.value
                                        const isChecked = e.target.checked;
                                        setDatosEnvio((prevValues) => ({
                                            ...prevValues,
                                            dias: isChecked
                                                ? [...prevValues.dias, value] // Agregar el valor al array
                                                : prevValues.dias.filter((dia) => dia !== value), // Eliminar el valor del array
                                        }));
                                    }} />
                                    <label className="form-check-label" htmlFor="martes">Martes</label>
                                </div>

                                <div className="form-check col centrar gap-1">
                                    <input className="form-check-input" type="checkbox" id="miercoles" name="dias[]" value="2" onChange={(e) => {
                                        const value = e.target.value
                                        const isChecked = e.target.checked;
                                        setDatosEnvio((prevValues) => ({
                                            ...prevValues,
                                            dias: isChecked
                                                ? [...prevValues.dias, value] // Agregar el valor al array
                                                : prevValues.dias.filter((dia) => dia !== value), // Eliminar el valor del array
                                        }));
                                    }} />
                                    <label className="form-check-label" htmlFor="miercoles">Miércoles</label>
                                </div>

                                <div className="form-check col centrar gap-1">
                                    <input className="form-check-input" type="checkbox" id="jueves" name="dias[]" value="3" onChange={(e) => {
                                        const value = e.target.value
                                        const isChecked = e.target.checked;
                                        setDatosEnvio((prevValues) => ({
                                            ...prevValues,
                                            dias: isChecked
                                                ? [...prevValues.dias, value] // Agregar el valor al array
                                                : prevValues.dias.filter((dia) => dia !== value), // Eliminar el valor del array
                                        }));
                                    }} />
                                    <label className="form-check-label" htmlFor="jueves">Jueves</label>
                                </div>

                                <div className="form-check col centrar gap-1">
                                    <input className="form-check-input" type="checkbox" id="viernes" name="dias[]" value="4" onChange={(e) => {
                                        const value = e.target.value
                                        const isChecked = e.target.checked;
                                        setDatosEnvio((prevValues) => ({
                                            ...prevValues,
                                            dias: isChecked
                                                ? [...prevValues.dias, value] // Agregar el valor al array
                                                : prevValues.dias.filter((dia) => dia !== value), // Eliminar el valor del array
                                        }));
                                    }} />
                                    <label className="form-check-label" htmlFor="viernes">Viernes</label>
                                </div>

                                <div className="form-check col centrar gap-1">
                                    <input className="form-check-input" type="checkbox" id="sabado" name="dias[]" value="5" onChange={(e) => {
                                        const value = e.target.value
                                        const isChecked = e.target.checked;
                                        setDatosEnvio((prevValues) => ({
                                            ...prevValues,
                                            dias: isChecked
                                                ? [...prevValues.dias, value] // Agregar el valor al array
                                                : prevValues.dias.filter((dia) => dia !== value), // Eliminar el valor del array
                                        }));
                                    }} />
                                    <label className="form-check-label" htmlFor="sabado">Sábado</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    isOpen={ToggleModal2} // Estado de apertura del modal
                    ToggleModal={setToggleModal2} // Función para cambiar el estado del modal
                    title={'Asesorias'} // Título del modal
                    footer={<button
                        className='btn btn-primary'
                        onClick={() => {
                            setToggleModal2(true)
                        }}
                    >
                        Guardar
                    </button>
                    }
                >
                    <Table Datos={DatosFiltrados}>
                        <thead className='border-bottom border-dark border-2 border-opacity-25'>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Curso</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Aula</th>
                                <th scope="col">Sede</th>
                                <th scope="col">Ciclo</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DatosFiltrados.map((dato, index) => {
                                return (
                                    <tr key={index + 1} onClick={() => setToggleModal2(true)}>
                                        <th>{index + 1}</th>
                                        <td>{dato.curso_nombre}</td>
                                        <td>{obtenerFechaEnFormato(dato.inicio)}</td>
                                        <td>{dato.aula_nombre}</td>
                                        <td>{dato.sede_nombre}</td>
                                        <td>{dato.ciclo_nombre}</td>
                                        <td>
                                            <button
                                                className='btn btn-sm btn-danger'
                                                onClick={async () => {
                                                    await deleteDoc(doc(db, "asesorias", dato.id)).then(() => {
                                                        alerta("success","Se ha eliminado la asesoria")
                                                    })

                                                }}>
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Modal>
            </div >
        </div >
    );
}

export default TutoringList;
