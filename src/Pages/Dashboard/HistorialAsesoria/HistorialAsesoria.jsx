import React, { useEffect, useState } from 'react';
import { db, useAuth } from '../../../Auth/AuthContext';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { obtenerFechaEnFormato, obtenerHora } from '../../../Functions/Funciones';
import Modal from '../../../Components/Modal/Modal';
import "./HistorialAsesoria.css"
import LoaderModulos from '../../../Components/LoaderModulos/loaderModulos';

const HistorialAsesoria = () => {
    const { currentUser } = useAuth(); // Obtiene el usuario actual

    const [HistoryData, setHistoryData] = useState(() => {
        // Obtener los datos de asesorías almacenados en el localStorage
        const SeccionesData = localStorage.getItem("HistoryData");
        // Parsear los datos si existen, de lo contrario, establecer un arreglo vacío
        return SeccionesData ? JSON.parse(SeccionesData) : [];
    });

    const [ToggleModal, setToggleModal] = useState(false); // Estado para controlar la apertura y cierre de un modal
    const [loading, setLoading] = useState(true); // Estado para controlar la carga de datos
    const [loadingModulo, setloadingModulo] = useState(true); // Estado para controlar la carga de un módulo específico
    const [AlumnosData, setAlumnosData] = useState([]); // Estado para almacenar datos de alumnos

    useEffect(() => {
        // Si HistoryData tiene elementos, se establece un temporizador para cambiar el estado de Loading a false después de 500 ms
        HistoryData.length > 0 && setTimeout(() => { setLoading(false) }, "500");

        let queryRef;

        if (currentUser.rol === "tutor") {
            queryRef = query(collection(db, "asesorias"), where("tutor", "==", currentUser.uid));
            // Si el rol del usuario actual es "tutor", se crea una referencia a una consulta Firestore filtrada por tutor
        } else {
            queryRef = where("alumnos", "array-contains-any", [{ asistio: true, uid: currentUser.uid }, { asistio: false, uid: currentUser.uid }]);
            // De lo contrario, se crea una referencia a una consulta Firestore filtrada por el uid del usuario actual
        }

        // Suscribe una función a los cambios en una consulta Firestore
        const unsubscribe = onSnapshot(query(collection(db, "asesorias"), queryRef, where("inicio", "<=", new Date()), orderBy("inicio", "desc")), async (querySnapshot) => {
            // Obtener los documentos de la colección "asesorias"
            const datos = await Promise.all(querySnapshot.docs.map(async (asesoriaDoc) => {
                const asesoriaData = asesoriaDoc.data();

                // Obtener datos adicionales de otros documentos relacionados
                const promises = [
                    getDoc(doc(db, "usuarios", asesoriaData.tutor)),
                    getDoc(doc(db, "cursos", asesoriaData.curso)),
                    getDoc(doc(db, "aulas", asesoriaData.aula)),
                    getDoc(doc(db, "sedes", asesoriaData.sede))
                ];

                //utiliza Promise.all() para ejecutar varias promesas en paralelo y esperar a que todas se resuelvan antes de continuar.
                const [tutorDoc, cursoDoc, aulaDoc, sedeDoc] = await Promise.all(promises);

                // Crear un objeto con los datos de la asesoría y los datos adicionales
                return {
                    id: asesoriaDoc.id,
                    tutor_nombre: tutorDoc.data().nombre,
                    curso_nombre: cursoDoc.data().nombre,
                    aula_nombre: aulaDoc.data().nombre,
                    sede_nombre: sedeDoc.data().nombre,
                    inicio: asesoriaData.inicio,
                    fin: asesoriaData.fin,
                    ...asesoriaData,
                };
            }));

            // Se verifica si hay nuevos datos comparando una representación en cadena de los datos con HistoryData
            const newDataExists = JSON.stringify(datos) !== HistoryData;

            if (newDataExists) {
                // Si hay nuevos datos, se guardan en el Local Storage
                localStorage.setItem("HistoryData", JSON.stringify(datos));

                // Se establecen los nuevos datos en el estado HistoryData
                setHistoryData(datos);
            }
            // Se cambia el estado loadingModulo a false
            setloadingModulo(false);
        });

        return () => unsubscribe(); // Se realiza la función de limpieza al desmontar el componente

    }, []);


    const OpenModalMarcacion = async (alumnosArr) => {
        setLoading(true); // Establece el estado Loading a true, mostrando un indicador de carga
        setToggleModal(true); // Establece el estado ToggleModal a true, mostrando un modal

        let datos = []; // Se inicializa un arreglo para almacenar los datos de los alumnos

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
        setLoading(false); // Establece el estado Loading a false, ocultando el indicador de carga
    }

    return (
        <div className='h-100-sm w-100 d-flex flex-column'>
            <div className='px-4 py-3 border-bottom '>
                <h1 className='fs-4 color-dark'>Historial Asesorias</h1>
            </div>
            <div className='content-dashboard'>
                {loadingModulo ?
                    <LoaderModulos /> // Muestra un componente de carga mientras se está cargando el historial
                    :
                    <>
                        <div className='px-0 px-md-4'>
                            {HistoryData.length === 0 ?
                                <div className='Data-notFound'>
                                    <i className="fa-regular fa-calendar-xmark"></i>
                                    <div>
                                        <p>Aún no has dado ninguna asesoría</p>
                                    </div>
                                </div>
                                :
                                HistoryData.map((asesoria) => {
                                    let flagAsistio = asesoria.alumnos.find(alumno => alumno.uid === currentUser.uid);
                                    return (
                                        <div className='mx-0' key={asesoria.id}>
                                            <div className='div-list row'>
                                                <div className='col'>
                                                    <h2 >{asesoria.curso_nombre}</h2>
                                                    <p className='text-capitalize'><i className="fa-solid fa-chalkboard-user"></i> {asesoria.tutor_nombre}</p>
                                                    <p className='text-capitalize'><i className="fa-regular fa-clock"></i> {obtenerHora(asesoria.inicio)} - {obtenerHora(asesoria.fin)}</p>
                                                    <p className='text-capitalize'><i className="fa-solid fa-building-columns"></i> {asesoria.aula_nombre} - {asesoria.sede_nombre}</p>
                                                </div>
                                                <div className='col'>
                                                    <p>
                                                        <i className="fa-solid fa-calendar-days"></i> {obtenerFechaEnFormato(asesoria.inicio)}
                                                    </p>
                                                    {
                                                        currentUser.rol === "tutor" ?
                                                            <button className='btn btn-primary btn-sm' onClick={() => OpenModalMarcacion(asesoria.alumnos)}>
                                                                Ver más
                                                            </button> // Botón para ver más detalles de la asesoría si el usuario es un tutor
                                                            :
                                                            <div className={`estado ${flagAsistio.asistio ? "Asistio" : "NoAsistio"}`}>
                                                                <span className="loader-estado"></span>{flagAsistio.asistio ? "Asistio" : "No asistio"}
                                                            </div> // Muestra el estado de asistencia del alumno si el usuario no es un tutor
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>

                        {/* Modal para mostrar los datos de la asistencia de los alumnos */}
                        <Modal
                            isOpen={ToggleModal}
                            ToggleModal={setToggleModal}
                            title={'Ver asistencias'}
                            isLoading={loading}
                        >
                            <div className='marcacion-div'>
                                {AlumnosData.length === 0 ?
                                    <tr className='text-center'>
                                        <td className='col'></td>
                                        <td className='col'>No hay alumnos registrados</td>
                                        <td className='col'></td>
                                    </tr>
                                    :
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
                                                            {alumno.asistio ?
                                                                <i className="fa-solid fa-circle-check"></i>
                                                                :
                                                                <i class="fa-solid fa-circle-xmark"></i>
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                }
                            </div>
                        </Modal>
                    </>
                }
            </div>
        </div>
    );
}

export default HistorialAsesoria;
