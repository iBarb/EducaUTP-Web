import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import FirebaseApp from '../../../Auth/FirebaseApp';
import { collection, doc, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { compararFecha, obtenerHora } from '../../../Functions/Funciones';
import { db, useAuth } from '../../../Auth/AuthContext';

const RecibirAsesoria = () => {
    const { currentUser, alerta } = useAuth()

    // Estado para almacenar los datos del calendario
    const [CalendarData, setCalendarData] = useState(() => {
        // obtener los datos del local storage
        const AsesoriasData = localStorage.getItem("AsesoriasData");
        // Si hay datos en el local storage, retornarlos, sino retornar un array vacio
        return AsesoriasData ? JSON.parse(AsesoriasData) : [];
    });

    // Estado para controlar la apertura/ cierre del modal
    const [ToggleModal, setToggleModal] = useState(false);

    // Estado para indicar si se está actualizando un evento
    const [isUpdating, setisUpdating] = useState(false);

    // Estado para almacenar el ID del evento actualmente seleccionado
    const [EventId, setEventId] = useState(null);

    // Estado para almacenar los datos del evento actualmente seleccionado
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

    // Estado para indicar si los datos se están cargando
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay datos en CalendarData y establecer loading en false después de 500ms
        CalendarData.length > 0 && setTimeout(() => { setLoading(false) }, "500");

        // Obtener una referencia a la colección "asesorias" en la base de datos
        let asesoriasRef = collection(db, "asesorias");

        // Establecer un listener para obtener los datos de la colección "asesorias" en tiempo real
        const unsubscribe = onSnapshot(asesoriasRef, async (querySnapshot) => {
            let datos = [];

            // Recorrer cada documento en el resultado de la consulta
            for (const asesoriaDoc of querySnapshot.docs) {
                let asesoriaData = asesoriaDoc.data();

                // Obtener los datos del tutor, curso, aula y sede relacionados a la asesoría
                let tutorDoc = await getDoc(doc(db, "usuarios", asesoriaData.tutor));
                let cursoDoc = await getDoc(doc(db, "cursos", asesoriaData.curso));
                let aulaDoc = await getDoc(doc(db, "aulas", asesoriaData.aula));
                let sedeDoc = await getDoc(doc(db, "sedes", asesoriaData.sede));

                // Crear un objeto con los datos de la asesoría y otros datos relacionados
                datos.push({
                    id: asesoriaDoc.id,
                    tutor_nombre: tutorDoc.data().nombre,
                    curso_nombre: cursoDoc.data().nombre,
                    aula_nombre: aulaDoc.data().nombre,
                    sede_nombre: sedeDoc.data().nombre,
                    ...asesoriaData,
                    // datos que se mostrarán en el calendario
                    title: cursoDoc.data().nombre,
                    start: new Date(asesoriaData.inicio.seconds * 1000 + asesoriaData.inicio.nanoseconds / 1000000),
                    end: new Date(asesoriaData.fin.seconds * 1000 + asesoriaData.fin.nanoseconds / 1000000),
                    backgroundColor: getBackgroundColor(asesoriaData.alumnos, asesoriaData.inicio, currentUser)
                });
            }

            // Verificar si los nuevos datos son diferentes a los existentes en CalendarData
            const newDataExists = JSON.stringify(datos) !== CalendarData;

            if (newDataExists) {
                // Guardar los nuevos datos en el Local Storage
                localStorage.setItem("AsesoriasData", JSON.stringify(datos));

                // Establecer los datos en el estado
                setCalendarData(datos);
            }
            setLoading(false);
        });

        // Devolver una función de limpieza para cancelar la suscripción a los cambios en la colección
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Buscar el evento en CalendarData que coincida con EventId
        CalendarData.find((evento) => {
            if (evento.id === EventId) {
                // Establecer los datos del evento en el estado EventData
                setEventData(evento);
                // Establecer isUpdating en false para indicar que no se está realizando una actualización
                setisUpdating(false)
            }
        })

    }, [EventId, CalendarData]);

    const getBackgroundColor = (alumnos, fecha, currentUser) => {
        // Verificar si la fecha es anterior a la fecha actual o si hay 5 alumnos inscritos y la fecha no es anterior a la fecha actual
        if (!compararFecha(fecha) || (alumnos.length === 5 && !compararFecha(fecha))) {
            return '#919191'// Color gris para indicar que la asesoría está pasada o llena
        } else {
            // Verificar si el usuario actual está incluido en la lista de alumnos
            return alumnos.includes(currentUser.uid) ? '#00a8ff' : '#27a56a'; // Color azul si el usuario está inscrito, color verde si no está inscrito
        }
    }

    const OnClickEvent = (info) => {
        setToggleModal(true) // Mostrar el modal
        setEventId(info.event.id); // Establecer el ID del evento seleccionado
    }

    // Inscribir al usuario actual en una asesoría específica
    const suscribeTutoria = async (id, alumnos_antiguos) => {
        setisUpdating(true); // Establecer el estado de actualización a true
        try {
            let asesoriasRef = doc(db, "asesorias", id); // Referencia a la asesoría en la base de datos
            let asesoriaDoc = await getDoc(asesoriasRef); // Obtener los datos de la asesoría
            let tutor_id = asesoriaDoc.data().tutor; // ID del tutor de la asesoría


            if (tutor_id === currentUser.uid) {
                alerta("error", "No puedes inscribirte a tu propia asesoria"); // Mostrar alerta de error si el usuario es el tutor de la asesoría
                setisUpdating(false); // Establecer el estado de actualización a false
            } else if (asesoriaDoc.data().alumnos.length === 5) {
                alerta("error", "La asesoria ya esta llena"); // Mostrar alerta de error si la asesoría está llena (5 alumnos)
                setisUpdating(false); // Establecer el estado de actualización a false
            } else {
                let nuevosDatos = {
                    uid: currentUser.uid,
                    asistio: false
                }; // Datos del usuario actual para la inscripción

                await updateDoc(asesoriasRef, {
                    alumnos: [...alumnos_antiguos, nuevosDatos] // Agregar los nuevos datos a la lista de alumnos
                }).then(() => {
                    alerta("success", "Se inscribió a la asesoría"); // Mostrar alerta de éxito
                });
            }
        } catch (error) {
            // Manejo de errores
        }
    };

    // Cancelar la inscripción del usuario actual en una asesoría específica
    const unsuscribeTutoria = async (id, alumnos) => {
        setisUpdating(true); // Establecer el estado de actualización a true
        try {
            let asesoriasRef = doc(db, "asesorias", id); // Referencia a la asesoría en la base de datos
            let newArr = alumnos.filter(a => a !== currentUser.uid); // Crear un nuevo array sin el usuario actual

            await updateDoc(asesoriasRef, {
                alumnos: newArr // Actualizar la lista de alumnos con el nuevo array
            });
        } catch (error) {
            console.error("Error al inscribir la tutoría:", error.message); // Mostrar mensaje de error en la consola
        } finally {
            alerta("info", "Se retiró de la asesoría"); // Mostrar alerta informativa
        }
    };

    return (
        <div className='h-100-sm w-100 d-flex flex-column'>
            <h1 className='fs-4 px-4 py-3 border-bottom color-dark'>Asesorias</h1>
            <div className='content-dashboard'>
                <CalendarList
                    data={CalendarData} // Datos del calendario
                    onclickEvent={OnClickEvent} // Función de clic en evento del calendario
                    isloading={loading} // Estado de carga del calendario
                />
                <Modal
                    isOpen={ToggleModal} // Estado de apertura del modal
                    ToggleModal={setToggleModal} // Función para cambiar el estado del modal
                    title={'Asesoria'} // Título del modal
                    footer={compararFecha(EventData.inicio, 168) ?
                        <>
                            <b>Recuerda: </b>Solo puedes inscribirte como máximo 1 semana antes
                        </>
                        :
                        <>
                            <b>Recuerda: </b>Puedes cancelar tu inscripción máximo 24h antes
                        </>
                    } // Contenido del pie de página del modal
                >
                    <div className='div-asesorias row'>
                        <div className='col'>
                            {/* Nombre del curso */}
                            <h2>{EventData.curso_nombre}</h2>
                            <p className='text-capitalize'><i className="fa-solid fa-chalkboard-user"></i> {EventData.tutor_nombre}</p> {/* Nombre del tutor*/}
                            <p className='text-capitalize'><i className="fa-regular fa-clock"></i> {obtenerHora(EventData.inicio)} - {obtenerHora(EventData.fin)}</p> {/* Hora de inicio y fin de la asesoría */}
                            <p className='text-capitalize'><i className="fa-solid fa-building-columns"></i> {EventData.aula_nombre} - {EventData.sede_nombre}</p> {/* Nombre del aula y sede */}
                        </div>
                        <div className='col'>
                            <p>{EventData.alumnos.length}/5</p>{/* Número de alumnos inscritos / cupo máximo */}

                            {!compararFecha(EventData.inicio) || EventData.tutor === currentUser.uid || EventData.alumnos.length === 5 ?
                                <button className='btn btn-secondary btn-sm' disabled>
                                    No Disponible {/* Botón no disponible si la asesoría está en curso, el usuario es el tutor o la asesoría está llena */}
                                </button>
                                :
                                EventData.alumnos.some(alumno => alumno.uid === currentUser.uid) ?
                                    <button className='btn btn-info btn-sm' disabled={isUpdating || !compararFecha(EventData.inicio, 24)} onClick={() => unsuscribeTutoria(EventData.id, EventData.alumnos)}>
                                        Restirarse  {/* Botón para cancelar la inscripción si el usuario ya está inscrito */}
                                    </button>
                                    :
                                    <button className='btn btn-success btn-sm' disabled={isUpdating || compararFecha(EventData.inicio, 168)} onClick={() => suscribeTutoria(EventData.id, EventData.alumnos)}>
                                        Inscribirse {/* Botón para inscribirse en la asesoría si el usuario no está inscrito y cumple los requisitos de tiempo */}
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
