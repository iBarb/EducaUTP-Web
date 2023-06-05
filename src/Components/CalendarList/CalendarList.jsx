import React, { useEffect, useRef } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import esLocale from '@fullcalendar/core/locales/es';
import './Calendar.css'
import LoaderModulos from '../LoaderModulos/loaderModulos';


const CalendarList = ({ data, onclickEvent, isloading }) => {

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

    const options = {
        plugins: [dayGridPlugin, listPlugin, timeGridPlugin],
        initialView: window.innerWidth < 1113 ? 'listWeek' : 'dayGridMonth',
        locale: esLocale,
        dayHeaderFormat: { weekday: 'long' },
        titleFormat: { month: 'short', day: 'numeric' },
        height: '90%',
        noEventsContent: 'No hay asesorías para mostrar',
        events: data.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start,
            end: e.end,
            backgroundColor: e.backgroundColor
        })),
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            meridiem: 'short'
        },
        eventClick: function (info) {
            onclickEvent(info)
        }
    };
    return (
        isloading ?
            <LoaderModulos />
            :
            <FullCalendar
                ref={calendarRef}
                {...options}
            />
    );
}

export default CalendarList;
