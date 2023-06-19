import React from 'react';

const HoraSelect = ({ id, name, className, max, min, step, onChange, value }) => {
    const horas = [];
    const horaMin = new Date(`2000-01-01T${min}`);
    const horaMax = new Date(`2000-01-01T${max}`);

    for (let hora = horaMin; hora <= horaMax; hora.setMinutes(hora.getMinutes() + step)) {
        const horaStr = hora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        horas.push(horaStr);
    }

    return (
        <select id={id} name={name} className={className} value={value} onChange={onChange}>
            <option value="" disabled>Seleccione un horario</option>
            {horas.map((hora, index) => (
                <option key={index} value={hora}>
                    {hora}
                </option>
            ))}
        </select>
    );
}

export default HoraSelect;
