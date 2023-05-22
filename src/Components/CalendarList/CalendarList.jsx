import React, { useEffect, useRef, useState } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import esLocale from '@fullcalendar/core/locales/es';
import './Calendar.css'

const CalendarList = () => {

    const calendarRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (calendarRef.current) {
                const ref = calendarRef.current.getApi();
                return window.innerWidth < 768 ? ref.changeView('listWeek') : ref.changeView('dayGridMonth');
            }
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const options = {
        plugins: [dayGridPlugin, listPlugin],
        initialView: window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth',
        locale: esLocale,
        dayHeaderFormat: { weekday: 'long' },
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
        height: '100%',
        noEventsContent: 'No hay asesorías para mostrar',
    };
    return (
        <FullCalendar
            ref={calendarRef}
            {...options}
        />
    );
}

export default CalendarList;
