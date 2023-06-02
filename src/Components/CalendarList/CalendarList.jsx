import React, { useEffect, useRef } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import esLocale from '@fullcalendar/core/locales/es';
import './Calendar.css'
import { useAuth } from '../../Auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarList = ({ data, ToggleModal, setEventId, isloading }) => {

    const { currentUser } = useAuth()

    const calendarRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (calendarRef.current) {
                const ref = calendarRef.current.getApi();

                const refWidth = calendarRef.current.elRef.current.offsetWidth;

                return refWidth < 800 ? ref.changeView('listWeek') : ref.changeView('dayGridMonth');
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const getBackgroundColor = (alumnos, currentUser) => {
        if (alumnos.length === 5) {
            return '#919191'
        } else {
            return alumnos.includes(currentUser.uid) ? '#00a8ff' : '#27a56a'
        }
    }

    const options = {
        plugins: [dayGridPlugin, listPlugin, timeGridPlugin],
        initialView: window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth',
        locale: esLocale,
        dayHeaderFormat: { weekday: 'long' },
        titleFormat: { month: 'short', day: 'numeric' },
        height: '90%',
        noEventsContent: 'No hay asesorías para mostrar',
        events: data.map((e) => ({
            id: e.id,
            title: e.curso_nombre,
            start: new Date(e.inicio.seconds * 1000),
            end: new Date(e.fin.seconds * 1000),
            backgroundColor: getBackgroundColor(e.alumnos, currentUser),
            datosEventos: e
        })),
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            meridiem: 'short'
        },
        eventClick: function (info) {
            ToggleModal(true)
            setEventId(info.event.id);
        }
    };
    return (
        <AnimatePresence>
            {isloading ?
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='loader-centrar'>
                    <span className="loader_calendar"></span>
                </motion.div>
                :
                <FullCalendar
                    ref={calendarRef}
                    {...options}
                />
            }
        </AnimatePresence>
    );
}

export default CalendarList;
