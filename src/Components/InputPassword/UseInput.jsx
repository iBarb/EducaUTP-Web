import React, { useState } from 'react';

const UseInput = (props) => {
    const [view, setview] = useState(false);
    const type = view ? "text" : "password";
    return (
        <>
            <input
                type={props.type === "password" ? type : props.type}
                className={props.className}
                name={props.name}
                id={props.id}
                placeholder={props.placeholder}
                autoComplete={props.autoComplete}
                onChange={props.onChange}
                onBlur={props.onBlur}
                value={props.value}
            />
            {props.type === "password" &&
                <span className="input-group-text" onClick={() => setview(view => !view)}>
                    {view ?
                        <svg width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="2.2" fill="none" xmlns="http://www.w3.org/2000/svg" color="#9da1a5"><path d="M3 13c3.6-8 14.4-8 18 0M12 17a3 3 0 110-6 3 3 0 010 6z" stroke="#9da1a5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        :
                        <svg width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="2.2" fill="none" xmlns="http://www.w3.org/2000/svg" color="#9da1a5"><path d="M19.5 16l-2.475-3.396M12 17.5V14M4.5 16l2.469-3.388M3 8c3.6 8 14.4 8 18 0" stroke="#9da1a5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    }
                </span>
            }
            <label htmlFor="input_password">{props.text}</label>
        </>
    );
}

export default UseInput;
