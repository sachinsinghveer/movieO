
import React from 'react';

const Input = props => {
    return (
        <input
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange ? (e) => props.onChange(e) : null}
            className="w-full bg-black text-text border-0 py-2 px-6 rounded-[30px] font-sans text-base"
        />
    );
}

export default Input;

