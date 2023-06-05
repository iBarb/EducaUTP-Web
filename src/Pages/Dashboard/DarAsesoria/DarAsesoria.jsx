import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import { db, useAuth } from '../../../Auth/AuthContext';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { compararFecha, obtenerHora } from '../../../Functions/Funciones';
import Switch from '../../../Components/Switch/Switch';
import { Formik } from 'formik';


const DarAsesoria = () => {
    // Obtener el usuario actual y la función de alerta del contexto de autenticación
    const { currentUser, alerta } = useAuth()

    const [CalendarData, setCalendarData] = useState(() => {
        // Obtener los datos de asesorías almacenados en el localStorage
        const SeccionesData = localStorage.getItem("MisAsesoriasData");
        // Parsear los datos si existen, de lo contrario, establecer un arreglo vacío
        return SeccionesData ? JSON.parse(SeccionesData) : [];
    });

    const [ToggleModal, setToggleModal] = useState(false); // Estado del modal para abrir o cerrar
    const [ToggleModal2, setToggleModal2] = useState(false); // Otro estado de modal para abrir o cerrar
    const [isUpdating, setisUpdating] = useState(false); // Estado para indicar si se está realizando una actualización

    const [EventId, setEventId] = useState(null); // ID del evento actual
    const [AlumnosData, setAlumnosData] = useState([]); // Datos de los alumnos

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
    }); // Datos del evento actual

    const [loading, setLoading] = useState(true); // Estado de carga para el primer proceso
    const [loading2, setLoading2] = useState(true); // Estado de carga para el segundo proceso

    useEffect(() => {
        // Comprobar si hay datos en CalendarData y establecer el estado de carga después de 500 milisegundos
        CalendarData.length > 0 && setTimeout(() => { setLoading(false) }, "500");

        // Crear una consulta para obtener las asesorías del tutor actual
        const q = query(collection(db, "asesorias"), where("tutor", "==", currentUser.uid));

        // Establecer un observador en la consulta para recibir actualizaciones en tiempo real
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const datos = [];

            // Iterar sobre los documentos de las asesorías
            for (const asesoriaDoc of querySnapshot.docs) {
                let asesoriaData = asesoriaDoc.data();

                // Obtener los datos del tutor, curso, aula y sede relacionados a la asesoría
                let tutorDoc = await getDoc(doc(db, "usuarios", asesoriaData.tutor));
                let cursoDoc = await getDoc(doc(db, "cursos", asesoriaData.curso));
                let aulaDoc = await getDoc(doc(db, "aulas", asesoriaData.aula));
                let sedeDoc = await getDoc(doc(db, "sedes", asesoriaData.sede));

                // Construir el objeto de datos para el evento de asesoría
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
                    backgroundColor: getBackgroundColor(asesoriaData.inicio)
                });
            }

            // Verificar si los nuevos datos son diferentes a los existentes en CalendarData
            const newDataExists = JSON.stringify(datos) !== CalendarData;

            if (newDataExists) {
                // Guardar los nuevos datos en el Local Storage
                localStorage.setItem("MisAsesoriasData", JSON.stringify(datos));

                // Establecer los datos en el estado
                setCalendarData(datos);
            }

            setLoading(false);
        });

        // Retornar una función de limpieza para cancelar la suscripción al observador al desmontar el componente
        return () => unsubscribe();
    }, []);


    useEffect(() => {
        // Buscar el evento seleccionado en CalendarData y establecer los datos del evento en el estado
        CalendarData.find((item) => {
            if (item.id === EventId) {
                setEventData(item);
                setisUpdating(false);
            }
        });
    }, [EventId, CalendarData]);

    // Función para obtener el color de fondo del evento según la fecha
    const getBackgroundColor = (fecha) => {
        if (compararFecha(fecha, 168)) {
            return '#FF6D00'; // Color naranja si la fecha está dentro de los próximos 7 días (168 horas)
        } else if (compararFecha(fecha, -1)) {
            return '#27a56a'; // color verde si se puede marcar asistencia
        } else {
            return '#919191'; // Color gris para otras fechas
        }
    }

    const OnClickEvent = (info) => {
        setToggleModal(true); // Establece el estado ToggleModal a true, mostrando un modal
        setEventId(info.event.id); // Establece el estado EventId con la propiedad info.event.id
    }

    const OpenModalMarcacion = async () => {
        setLoading2(true); // Establece el estado Loading2 a true, mostrando un indicador de carga
        setisUpdating(true); // Establece el estado isUpdating a true
    
        setToggleModal2(true); // Establece el estado ToggleModal2 a true, mostrando otro modal para la marcacion
    
        let datos = [];
        let alumnosArr = (await getDoc(doc(db, "asesorias", EventId))).data().alumnos;
        // Obtiene los datos de un documento en la base de datos utilizando el EventId como identificador
    
        for (const alumno of alumnosArr) {
            let alumno_nombre = (await getDoc(doc(db, "usuarios", alumno.uid))).data().nombre;
            // Obtiene el nombre del alumno desde otro documento en la base de datos
    
            datos.push({
                nombre: alumno_nombre,
                ...alumno
            });
            // Agrega los datos del alumno al arreglo datos
        }
    
        setAlumnosData(datos); // Establece el estado AlumnosData con los datos obtenidos
        setLoading2(false); // Establece el estado Loading2 a false
        setisUpdating(false); // Establece el estado isUpdating a false
    }

    const handleSwitchChange = (index, value) => {
        const updatedAlumnosData = [...AlumnosData];
        updatedAlumnosData[index].asistio = value;
        // Actualiza la propiedad asistio en el alumno correspondiente
    
        setAlumnosData(updatedAlumnosData); // Establece el estado AlumnosData con los datos actualizados
    };
    const GuardarDatosMarcacion = async () => {
        setisUpdating(true); // Establece el estado isUpdating a true
    
        try {
            let asesoriasRef = doc(db, "asesorias", EventId);
            // Crea una referencia al documento en la base de datos utilizando el EventId
    
            let newArr = AlumnosData.map((item) => {
                return {
                    uid: item.uid,
                    asistio: item.asistio,
                };
            });
            // Crea un nuevo arreglo newArr mapeando los elementos de AlumnosData a el alumno con su uid y y su flag si asistio o no
    
            await updateDoc(asesoriasRef, {
                alumnos: newArr
            });
            // Actualiza el documento en la base de datos con el nuevo arreglo newArr
    
            alerta("success", "Se actualizaron los datos"); // Muestra una alerta de éxito
            setisUpdating(false); // Establece el estado isUpdating a false
            setToggleModal2(false); // Establece el estado ToggleModal2 a false, cerrando el modal
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
                            <p className='text-capitalize'><i className="fa-regular fa-clock"></i> {obtenerHora(EventData.inicio)} - {obtenerHora(EventData.fin)}</p>
                            <p className='text-capitalize'><i className="fa-solid fa-building-columns"></i> {EventData.aula_nombre} - {EventData.sede_nombre}</p>
                        </div>
                        <div className='col'>
                            <p>{EventData.alumnos.length}/5</p>
                            {compararFecha(EventData.inicio, -1) ?
                                <button className='btn btn-success btn-sm' disabled={isUpdating || compararFecha(EventData.inicio)} onClick={() => OpenModalMarcacion()}>
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
