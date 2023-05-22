import React from 'react';
import CalendarList from '../../../Components/CalendarList/CalendarList';

const RecibirAsesoria = () => {
    return (
        <div className='w-100 d-flex flex-column'>
            <h1 className='fs-4 px-4 py-3 border-bottom'>Asesorias</h1>
            <div className='content-dashboard'>
                <CalendarList />
            </div>
        </div>
    );
}

export default RecibirAsesoria;
