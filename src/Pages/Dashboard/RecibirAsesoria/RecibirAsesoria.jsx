import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import FirebaseApp from '../../../Auth/FirebaseApp';
import { collection, doc, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { obtenerHora } from '../../../Functions/Funciones';
import { db, useAuth } from '../../../Auth/AuthContext';

const RecibirAsesoria = () => {
    const { currentUser, alerta } = useAuth()

    const [CalendarData, setCalendarData] = useState(() => {
        const AsesoriasData = localStorage.getItem("AsesoriasData");
        return AsesoriasData ? JSON.parse(AsesoriasData) : [];
    });
    const [ToggleModal, setToggleModal] = useState(false);
    const [isUpdating, setisUpdating] = useState(false);
    const [EventId, setEventId] = useState(null);
    const [EventData, setEventData] = useState({
        id: '',
        tutor_nombre: '',
        tutor: '',
        tema: '',
        sede: '',
        inicio: '',
        fin: '',
        curso_nombre: '',
        curso: '',
        aula: '',
        seccion: '',
        alumnos: [],
    });

    const [loading, setLoading] = useState(() => {
        const AsesoriasData = localStorage.getItem("AsesoriasData");
        return AsesoriasData ? false : true;
    }
    );

    useEffect(() => {
        let asesoriasRef = collection(db, "asesorias");

        onSnapshot(asesoriasRef, async (querySnapshot) => {
            let datos = [];
            for (const asesoriaDoc of querySnapshot.docs) {
                let asesoriaData = asesoriaDoc.data();
                let tutorDoc = await getDoc(doc(db, "usuarios", asesoriaData.tutor));
                let cursoDoc = await getDoc(doc(db, "cursos", asesoriaData.curso));
                let seccionDoc = await getDoc(doc(db, "secciones", asesoriaData.seccion));

                datos.push({
                    id: asesoriaDoc.id,
                    tutor_nombre: tutorDoc.data().nombre,
                    curso_nombre: cursoDoc.data().nombre,
                    sede: seccionDoc.data().sede,
                    inicio: seccionDoc.data().inicio,
                    fin: seccionDoc.data().fin,
                    aula: seccionDoc.data().aula,
                    ...asesoriaData,
                    // datos hacer set a los eventos
                    title: cursoDoc.data().nombre,
                    start: new Date(seccionDoc.data().inicio.seconds * 1000),
                    end: new Date(seccionDoc.data().fin.seconds * 1000),
                    backgroundColor: getBackgroundColor(asesoriaData.alumnos, currentUser)
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

    }, []);

    useEffect(() => {
        CalendarData.find((item) => {
            if (item.id === EventId) {
                setEventData(item);
                setisUpdating(false)
            }
        })

    }, [EventId, CalendarData]);

    const getBackgroundColor = (alumnos, currentUser) => {
        if (alumnos.length === 5) {
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

            await updateDoc(asesoriasRef, {
                alumnos: [...alumnos_antiguos, currentUser.uid]
            });

        } catch (error) {

            console.error("Error al inscribir la tutoría:", error.message);
        } finally {
            alerta("success", "Se inscribio a la asesoria")
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
            <h1 className='fs-4 px-4 py-3 border-bottom'>Asesorias</h1>
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
                >
                    <div className='div-asesorias row'>
                        <div className='col'>
                            <h2 >{EventData.curso_nombre} - {EventData.tema}</h2>
                            <p className='text-capitalize'>{EventData.tutor_nombre}</p>
                            <p className='text-capitalize'>{obtenerHora(EventData.inicio.seconds)} - {obtenerHora(EventData.fin.seconds)}</p>
                            <p className='text-capitalize'>{EventData.aula} - {EventData.sede}</p>
                        </div>
                        <div className='col'>
                            <p>{EventData.alumnos.length}/5</p>
                            {EventData.alumnos.length === 5 ?
                                <button className='btn btn-secondary btn-sm' disabled>
                                    No Disponible
                                </button>
                                : EventData.alumnos.includes(currentUser.uid) ?
                                    <button className='btn btn-info btn-sm' disabled={isUpdating} onClick={() => unsuscribeTutoria(EventData.id, EventData.alumnos)}>
                                        Inscrito
                                    </button>
                                    :
                                    <button className='btn btn-success btn-sm' disabled={isUpdating} onClick={() => suscribeTutoria(EventData.id, EventData.alumnos)}>
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
