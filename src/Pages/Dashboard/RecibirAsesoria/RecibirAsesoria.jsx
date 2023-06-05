import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import FirebaseApp from '../../../Auth/FirebaseApp';
import { collection, doc, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { compararFecha, obtenerHora } from '../../../Functions/Funciones';
import { db, useAuth } from '../../../Auth/AuthContext';

const RecibirAsesoria = () => {
    const { currentUser, alerta } = useAuth()

    const [CalendarData, setCalendarData] = useState(() => {
        // obtener los datos del local storage
        const AsesoriasData = localStorage.getItem("AsesoriasData");
        // Si hay datos en el local storage, retornarlos, sino retornar un array vacio
        return AsesoriasData ? JSON.parse(AsesoriasData) : [];
    });
    const [ToggleModal, setToggleModal] = useState(false);
    const [isUpdating, setisUpdating] = useState(false);
    const [EventId, setEventId] = useState(null);
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

    useEffect(() => {
        CalendarData.length > 0 && setTimeout(() => { setLoading(false) }, "500");

        let asesoriasRef = collection(db, "asesorias");

        const unsubscribe = onSnapshot(asesoriasRef, async (querySnapshot) => {
            let datos = [];
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
                    backgroundColor: getBackgroundColor(asesoriaData.alumnos, asesoriaData.inicio.seconds, currentUser)
                });
            }

            const newDataExists = JSON.stringify(datos) !== CalendarData;

            if (newDataExists) {
                // Guardar los nuevos datos en el Local Storage
                localStorage.setItem("AsesoriasData", JSON.stringify(datos));

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

    const getBackgroundColor = (alumnos, fecha, currentUser) => {
        if (!compararFecha(fecha) || (alumnos.length === 5 && !compararFecha(fecha))) {
            return '#919191'
        } else {
            return alumnos.includes(currentUser.uid) ? '#00a8ff' : '#27a56a'
        }
    }

    const OnClickEvent = (info) => {
        setToggleModal(true)
        setEventId(info.event.id);
    }

    const suscribeTutoria = async (id, alumnos_antiguos) => {
        setisUpdating(true)
        try {
            let asesoriasRef = doc(db, "asesorias", id);
            let asesoriaDoc = await getDoc(asesoriasRef);
            let tutor_id = asesoriaDoc.data().tutor;

            if (tutor_id === currentUser.uid) {
                alerta("error", "No puedes inscribirte a tu propia asesoria")
                setisUpdating(false)
            } else if (asesoriaDoc.data().alumnos.length === 5) {
                alerta("error", "La asesoria ya esta llena")
                setisUpdating(false)
            } else {

                let nuevosDatos = {
                    uid: currentUser.uid,
                    asistio: false
                };

                await updateDoc(asesoriasRef, {
                    alumnos: [...alumnos_antiguos, nuevosDatos]
                }).then(() => {
                    alerta("success", "Se inscribio a la asesoria")
                })
            }

        } catch (error) {

        }

    };

    const unsuscribeTutoria = async (id, alumnos) => {
        setisUpdating(true)
        try {

            let asesoriasRef = doc(db, "asesorias", id);
            let newArr = alumnos.filter(a => a !== currentUser.uid)

            await updateDoc(asesoriasRef, {
                alumnos: newArr
            });

        } catch (error) {

            console.error("Error al inscribir la tutoría:", error.message);
        } finally {
            alerta("info", "Se retiró de la asesoría")
        }

    };

    return (

        <div className='h-100-sm w-100 d-flex flex-column'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Asesorias</h1>
            <div className='content-dashboard'>
                <CalendarList
                    data={CalendarData}
                    onclickEvent={OnClickEvent}
                    isloading={loading}
                />
                <Modal
                    isOpen={ToggleModal}
                    ToggleModal={setToggleModal}
                    title={'Asesoria'}
                    footer={compararFecha(EventData.inicio.seconds, 168) ?
                        <>
                            <b>Recuerda: </b>Solo puedes inscribirte como máximo 1 semana antes
                        </>
                        :
                        <>
                            <b>Recuerda: </b>Puedes cancelar tu inscripción máximo 24h antes
                        </>
                        }
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

                            {!compararFecha(EventData.inicio.seconds) || EventData.tutor === currentUser.uid || EventData.alumnos.length === 5 ?
                                <button className='btn btn-secondary btn-sm' disabled>
                                    No Disponible
                                </button>
                                :
                                EventData.alumnos.some(alumno => alumno.uid === currentUser.uid) ?
                                    <button className='btn btn-info btn-sm' disabled={isUpdating || !compararFecha(EventData.inicio.seconds, 24)} onClick={() => unsuscribeTutoria(EventData.id, EventData.alumnos)}>
                                        Restirarse
                                    </button>
                                    :
                                    <button className='btn btn-success btn-sm' disabled={isUpdating || compararFecha(EventData.inicio.seconds, 168)} onClick={() => suscribeTutoria(EventData.id, EventData.alumnos)}>
                                        Inscribirse
                                    </button>
                            }
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default RecibirAsesoria;
