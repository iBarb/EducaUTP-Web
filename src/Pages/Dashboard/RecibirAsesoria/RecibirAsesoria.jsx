import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import FirebaseApp from '../../../Auth/FirebaseApp';
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { obtenerHora } from '../../../Functions/Funciones';
import { useAuth } from '../../../Auth/AuthContext';

const db = getFirestore(FirebaseApp);

const RecibirAsesoria = () => {
    const { currentUser, alerta } = useAuth()

    const [CalendarData, setCalendarData] = useState([]);
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
        alumnos: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let asesoriasRef = collection(db, "asesorias");


        onSnapshot(asesoriasRef, async (querySnapshot) => {
            let datos = [];
            for (const asesoriaDoc of querySnapshot.docs) {
                const asesoriaData = asesoriaDoc.data();
                const tutor_nombre = await getDoc(doc(db, "usuarios", asesoriaData.tutor));
                const curso_nombre = await getDoc(doc(db, "cursos", asesoriaData.curso));

                datos.push({
                    id: asesoriaDoc.id,
                    tutor_nombre: tutor_nombre.data().nombre,
                    curso_nombre: curso_nombre.data().nombre,
                    ...asesoriaData,
                });
            }
            setCalendarData(datos);
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



    const suscribeTutoria = async (id, alumnos_antiguos) => {
        setisUpdating(true)
        try {
            console.log("ejecutandose");

            let asesoriasRef = doc(db, "asesorias", id);

            await updateDoc(asesoriasRef, {
                alumnos: [...alumnos_antiguos, currentUser.uid]
            });

        } catch (error) {

            console.error("Error al inscribir la tutoría:", error.message);
        } finally{
            alerta("success", "Se actualizo correctamente")
        }

    };

    const unsuscribeTutoria = async (id, alumnos) => {
        setisUpdating(true)
        try {
            console.log("ejecutandose");

            let asesoriasRef = doc(db, "asesorias", id);
            let newArr = alumnos.filter(a => a !== currentUser.uid)

            await updateDoc(asesoriasRef, {
                alumnos: newArr
            });

        } catch (error) {

            console.error("Error al inscribir la tutoría:", error.message);
        } finally{
            alerta("success", "Se actualizo correctamente")
        }

    };

    return (

        <div className='h-100-sm w-100 d-flex flex-column'>
            <h1 className='fs-4 px-4 py-3 border-bottom'>Asesorias</h1>
            <div className='content-dashboard'>
                <CalendarList
                    data={CalendarData}
                    ToggleModal={setToggleModal}
                    setEventId={setEventId}
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
