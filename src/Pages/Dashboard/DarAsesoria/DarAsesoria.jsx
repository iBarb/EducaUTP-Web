import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import { db, useAuth } from '../../../Auth/AuthContext';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { compararFecha, obtenerHora } from '../../../Functions/Funciones';
import Switch from '../../../Components/Switch/Switch';
import { Formik } from 'formik';


const DarAsesoria = () => {
    const { currentUser, alerta } = useAuth()
    const [CalendarData, setCalendarData] = useState(() => {
        const SeccionesData = localStorage.getItem("MisAsesoriasData");
        return SeccionesData ? JSON.parse(SeccionesData) : [];
    });

    const [ToggleModal, setToggleModal] = useState(false);
    const [ToggleModal2, setToggleModal2] = useState(false);
    const [isUpdating, setisUpdating] = useState(false);
    const [EventId, setEventId] = useState(null);
    const [AlumnosData, setAlumnosData] = useState([]);
    const [EventData, setEventData] = useState({
        id: '',
        tutor_nombre: '',
        tutor: '',
        inicio: '',
        fin: '',
        aula_nombre: '',
        sede_nombre: '',
        curso_nombre: '',
        curso: '',
        aula: '',
        sede: '',
        alumnos: [],
    });

    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(true);

    useEffect(() => {
        CalendarData.length > 0 && setTimeout(() => { setLoading(false) }, "500");

        const q = query(collection(db, "asesorias"), where("tutor", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const datos = [];
            for (const asesoriaDoc of querySnapshot.docs) {
                let asesoriaData = asesoriaDoc.data();
                let tutorDoc = await getDoc(doc(db, "usuarios", asesoriaData.tutor));
                let cursoDoc = await getDoc(doc(db, "cursos", asesoriaData.curso));
                let aulaDoc = await getDoc(doc(db, "aulas", asesoriaData.aula));
                let sedeDoc = await getDoc(doc(db, "sedes", asesoriaData.sede));

                datos.push({
                    id: asesoriaDoc.id,
                    tutor_nombre: tutorDoc.data().nombre,
                    curso_nombre: cursoDoc.data().nombre,
                    aula_nombre: aulaDoc.data().nombre,
                    sede_nombre: sedeDoc.data().nombre,
                    inicio: asesoriaData.inicio,
                    fin: asesoriaData.fin,
                    ...asesoriaData,
                    // datos hacer set a los eventos
                    title: cursoDoc.data().nombre,
                    start: new Date(asesoriaData.inicio.seconds * 1000),
                    end: new Date(asesoriaData.fin.seconds * 1000),
                    backgroundColor: getBackgroundColor(asesoriaData.inicio.seconds)
                });
            };

            const newDataExists = JSON.stringify(datos) !== CalendarData;

            if (newDataExists) {
                // Guardar los nuevos datos en el Local Storage
                localStorage.setItem("MisAsesoriasData", JSON.stringify(datos));

                // Establecer los datos en el estado
                setCalendarData(datos);
            }
            setLoading(false);
        });

        return () => unsubscribe();

    }, []);

    useEffect(() => {
        CalendarData.find((item) => {
            if (item.id === EventId) {
                setEventData(item);
                setisUpdating(false)
            }
        })

    }, [EventId, CalendarData]);

    const getBackgroundColor = (fecha) => {
        if (compararFecha(fecha, 168)) {
            return '#FF6D00';
        } else if (compararFecha(fecha, -1)) {
            return '#27a56a';
        } else {
            return '#919191';
        }
    }

    const OnClickEvent = (info) => {
        setToggleModal(true)
        setEventId(info.event.id);
    }

    const OpenModalMarcacion = async () => {
        setLoading2(true)
        setisUpdating(true)
        setToggleModal2(true)

        let datos = [];
        let alumnosArr = (await getDoc(doc(db, "asesorias", EventId))).data().alumnos;

        for (const alumno of alumnosArr) {
            let alumno_nombre = (await getDoc(doc(db, "usuarios", alumno.uid))).data().nombre;
            
            datos.push({
                nombre: alumno_nombre,
                ...alumno
            })
        }
        setAlumnosData(datos);
        setLoading2(false)
        setisUpdating(false)

    }

    const handleSwitchChange = (index, value) => {
        const updatedAlumnosData = [...AlumnosData];
        updatedAlumnosData[index].asistio = value;
        setAlumnosData(updatedAlumnosData);
    };

    const GuardarDatosMarcacion = async() => {
        setisUpdating(true)
        try {

            let asesoriasRef = doc(db, "asesorias", EventId);
            let newArr = AlumnosData.map((item) => {
                return{
                    uid: item.uid,
                    asistio: item.asistio,
                }
            });

            await updateDoc(asesoriasRef, {
                alumnos: newArr
            });

            alerta("success", "Se actualizaron los datos")
            setisUpdating(false)
            setToggleModal2(false)

        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className='h-100-sm w-100 d-flex flex-column'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Mis Asesorias</h1>
            <div className='content-dashboard'>
                <CalendarList
                    data={CalendarData}
                    onclickEvent={OnClickEvent}
                    isloading={loading}
                />

                {/* Modal para mostrar los datos de la asesoria */}
                <Modal
                    isOpen={ToggleModal}
                    ToggleModal={setToggleModal}
                    title={'Mis Asesorias'}
                >
                    <div className='div-asesorias row'>
                        <div className='col'>
                            <h2 >{EventData.curso_nombre}</h2>
                            <p className='text-capitalize'><i className="fa-solid fa-chalkboard-user"></i> {EventData.tutor_nombre}</p>
                            <p className='text-capitalize'><i className="fa-regular fa-clock"></i> {obtenerHora(EventData.inicio.seconds)} - {obtenerHora(EventData.fin.seconds)}</p>
                            <p className='text-capitalize'><i className="fa-solid fa-building-columns"></i> {EventData.aula_nombre} - {EventData.sede_nombre}</p>
                        </div>
                        <div className='col'>
                            <p>{EventData.alumnos.length}/5</p>
                            {compararFecha(EventData.inicio.seconds, -1) ?
                                <button className='btn btn-success btn-sm' disabled={isUpdating || compararFecha(EventData.inicio.seconds)} onClick={() => OpenModalMarcacion()}>
                                    Marcar Asistencia
                                </button>
                                :
                                <button className='btn btn-secondary btn-sm' disabled>
                                    No Disponible
                                </button>
                            }
                        </div>
                    </div>
                </Modal>

                {/* Modal para mostrar lso datos para marcar asistencia con formulario para envio de datos*/}
                <Modal
                    isOpen={ToggleModal2}
                    ToggleModal={setToggleModal2}
                    title={'Marcar asistencia'}
                    footer={
                        <button className='btn btn-primary' disabled={isUpdating} onClick={GuardarDatosMarcacion}>Guardar</button>
                    }
                    isLoading={loading2}
                >
                    <div className='marcacion-div'>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Nombre y Apellido</th>
                                    <th scope="col" className='centrar'>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {AlumnosData.map((alumno, i) => {
                                        return (
                                            <tr key={alumno.uid}>
                                                <td>{i + 1}</td>
                                                <td>{alumno.nombre}</td>
                                                <td className='centrar'>
                                                    <Switch
                                                        id={`switch-${i}`}
                                                        value={alumno.asistio}
                                                        onChange={handleSwitchChange}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}

                            </tbody>
                        </table>

                    </div>
                </Modal>
            </div>
        </div >
    );
}

export default DarAsesoria;
