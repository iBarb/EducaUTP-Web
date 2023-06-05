import React, { useState } from 'react';
import './Switch.css';

const Switch = ({ id, value, disabled , onChange }) => {

    const handleInputChange = (event) => {
        let indice = id.split("-")[1]
        let newValue = event.target.checked;
        onChange(indice, newValue);
    };


    return (
        <div className="toggle-switch">
            <input className="toggle-input"
                id={id}
                disabled={disabled}
                type="checkbox"
                checked={value}
                onChange={handleInputChange}
            />
            <label className="toggle-label" htmlFor={id}></label>
        </div>

    );
}

export default Switch;
