import React, { useEffect, useState } from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';
import { db, useAuth } from '../../../Auth/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import Modal from '../../../Components/Modal/Modal';
import { obtenerHora } from '../../../Functions/Funciones';

const DarAsesoria = () => {
    const { currentUser, alerta } = useAuth()
    const [CalendarData, setCalendarData] = useState(() => {
        const SeccionesData = localStorage.getItem("SeccionesData");
        return SeccionesData ? JSON.parse(SeccionesData) : [];
    });

    const [ToggleModal, setToggleModal] = useState(false);
    const [isUpdating, setisUpdating] = useState(false);
    const [EventId, setEventId] = useState(null);
    const [EventData, setEventData] = useState({
        id: '',
        sede: '',
        inicio: '',
        fin: '',
        aula: '',
    });

    const [loading, setLoading] = useState(() => {
        const AsesoriasData = localStorage.getItem("AsesoriasData");
        return AsesoriasData ? false : true;
    }
    );

    useEffect(() => {
        let seccionesRef = collection(db, "secciones");

        onSnapshot(seccionesRef, async (querySnapshot) => {
            let datos = [];
            for (const seccionesDoc of querySnapshot.docs) {
                let seccionesData = seccionesDoc.data();

                datos.push({
                    id: seccionesDoc.id,
                    ...seccionesData,
                    // datos hacer set a los eventos
                    title: seccionesData.sede + " - " + seccionesData.aula,
                    start: new Date(seccionesData.inicio.seconds * 1000),
                    end: new Date(seccionesData.fin.seconds * 1000),
                    backgroundColor: getBackgroundColor(seccionesData.disponible)
                });
            }

            const newDataExists = JSON.stringify(datos) !== CalendarData;

            if (newDataExists) {
                // Guardar los nuevos datos en el Local Storage
                localStorage.setItem("SeccionesData", JSON.stringify(datos));

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

    const getBackgroundColor = (flag) => {
        if (flag) {
            return '#27a56a'
        } else {
            return '#B40C32'
        }
    }

    const OnClickEvent = (info) => { 
        setToggleModal(true)
        setEventId(info.event.id);
    }


    return (
        <div className='h-100-sm w-100 d-flex flex-column'>
            <h1 className='fs-4 px-4 py-3 border-bottom'>Brindar Asesoria</h1>
            <div className='content-dashboard'>
                <CalendarList
                    data={CalendarData}
                    onclickEvent={OnClickEvent}
                    isloading={loading}
                />
                <Modal
                    isOpen={ToggleModal}
                    ToggleModal={setToggleModal}
                    title={'Secciones'}
                >
                    <div className='div-asesorias row'>
                        <div className='col'>
                            <h2 >{EventData.title}</h2>
                            <p className='text-capitalize'>{EventData.tutor_nombre}</p>
                            <p className='text-capitalize'>{obtenerHora(EventData.inicio.seconds)} - {obtenerHora(EventData.fin.seconds)}</p>
                            <p className='text-capitalize'>{EventData.aula} - {EventData.sede}</p>
                        </div>
                        <div className='col'>
                            <p></p>
                            {EventData.disponible ?
                                <button className='btn btn-info btn-sm' disabled={isUpdating} onClick={() => unsuscribeTutoria(EventData.id, EventData.alumnos)}>
                                    Solicitar
                                </button>
                                :
                                <button className='btn btn-secondary btn-sm' disabled>
                                    No Disponible
                                </button>
                            }
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default DarAsesoria;
