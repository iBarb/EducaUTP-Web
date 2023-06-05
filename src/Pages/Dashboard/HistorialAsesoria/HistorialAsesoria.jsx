import React, { useEffect, useState } from 'react';
import { db, useAuth } from '../../../Auth/AuthContext';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { obtenerFechaEnFormato, obtenerHora } from '../../../Functions/Funciones';
import Modal from '../../../Components/Modal/Modal';
import "./HistorialAsesoria.css"
import LoaderModulos from '../../../Components/LoaderModulos/loaderModulos';

const HistorialAsesoria = () => {
    const { currentUser } = useAuth()

    const [HistoryData, setHistoryData] = useState(() => {
        const SeccionesData = localStorage.getItem("HistoryData");
        return SeccionesData ? JSON.parse(SeccionesData) : [];
    });
    const [ToggleModal, setToggleModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingModulo, setloadingModulo] = useState(true);
    const [AlumnosData, setAlumnosData] = useState([]);

    useEffect(() => {
        HistoryData.length > 0 && setTimeout(() => { setLoading(false) }, "500"); //Solucion error en DOM, problemas de renderizado

        let queryRef

        if (currentUser.rol === "tutor") {
            queryRef = query(collection(db, "asesorias"), where("tutor", "==", currentUser.uid))
        } else {
            queryRef = where("alumnos", "array-contains-any", [{ asistio: true, uid: currentUser.uid }, { asistio: false, uid: currentUser.uid }])
        }

        const unsubscribe = onSnapshot(query(collection(db, "asesorias"), queryRef, where("inicio", "<=", new Date()), orderBy("inicio", "desc")), async (querySnapshot) => {
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
                });
            };

            const newDataExists = JSON.stringify(datos) !== HistoryData; // true o false

            if (newDataExists) {
                // Guardar los nuevos datos en el Local Storage
                localStorage.setItem("HistoryData", JSON.stringify(datos));

                // Establecer los datos en el estado
                setHistoryData(datos);
            }
            setloadingModulo(false);
        });

        return () => unsubscribe();

    }, []);


    const OpenModalMarcacion = async (alumnosArr) => {
        setLoading(true)
        setToggleModal(true)

        let datos = [];

        for (const alumno of alumnosArr) {
            let alumno_nombre = (await getDoc(doc(db, "usuarios", alumno.uid))).data().nombre;

            datos.push({
                nombre: alumno_nombre,
                ...alumno
            })
        }

        setAlumnosData(datos);
        setLoading(false)

    }

    return (
        <div className='h-100-sm w-100 d-flex flex-column'>
            <div className='px-4 py-3 border-bottom '>
                <h1 className='fs-4 color-dark'>Historial Asesorias</h1>
            </div>
            <div className='content-dashboard'>
                {loadingModulo ?
                    <LoaderModulos/>
                :
                    <>
                        <div className='px-0 px-sm-4'>
                            {HistoryData.map((asesoria) => {
                                let flagAsistio = asesoria.alumnos.find(alumno => alumno.uid === currentUser.uid);
                                return (
                                    <div className='mx-0' key={asesoria.id}>
                                        <div className='div-list row'>
                                            <div className='col'>
                                                <h2 >{asesoria.curso_nombre}</h2>
                                                <p className='text-capitalize'><i className="fa-solid fa-chalkboard-user"></i> {asesoria.tutor_nombre}</p>
                                                <p className='text-capitalize'><i className="fa-regular fa-clock"></i> {obtenerHora(asesoria.inicio.seconds)} - {obtenerHora(asesoria.fin.seconds)}</p>
                                                <p className='text-capitalize'><i className="fa-solid fa-building-columns"></i> {asesoria.aula_nombre} - {asesoria.sede_nombre}</p>
                                            </div>
                                            <div className='col'>
                                                <p>
                                                    <i className="fa-solid fa-calendar-days"></i> {obtenerFechaEnFormato(asesoria.inicio.seconds)}
                                                </p>
                                                {
                                                    currentUser.rol === "tutor" ?
                                                        <button className='btn btn-primary btn-sm' onClick={() => OpenModalMarcacion(asesoria.alumnos)}>
                                                            Ver más
                                                        </button>
                                                        :
                                                        <div className={`estado ${flagAsistio.asistio ? "Asistio" : "NoAsistio"}`}>
                                                            <span className="loader-estado"></span>{flagAsistio.asistio ? "Asistio" : "No asistio"}
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Modal para mostrar lso datos para mostrar la asistencia de los alumnos*/}
                        <Modal
                            isOpen={ToggleModal}
                            ToggleModal={setToggleModal}
                            title={'Marcar asistencia'}
                            isLoading={loading}
                        >
                            <div className='marcacion-div'>
                                {AlumnosData.length === 0 ?
                                    <tr className='text-center'>
                                        <td className='col'></td>
                                        <td className='col'>No hay alumnos registrados registrados</td>
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
