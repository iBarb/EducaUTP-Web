import React from 'react';

const Button = ({
    isUpdating,
    onClick,
    className,
    children
}) => {
    return (
        <button className={className} disabled={isUpdating} onClick={onClick}>
            {isUpdating ?
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                :
                children
            }
        </button>
    );
}

export default Button;
