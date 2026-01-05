'use client';

import React, { useState, useEffect, useRef } from 'react';

import PropTypes from 'prop-types';

const Modal = props => {

    const [active, setActive] = useState(false);

    useEffect(() => {
        setActive(props.active);
    }, [props.active]);

    return (
        <div id={props.id} className={`fixed z-[100] inset-0 overflow-auto bg-black/40 flex items-center justify-center opacity-0 invisible transition-opacity duration-300 ${active ? '!opacity-100 !visible' : ''}`}>
            {props.children}
        </div>
    );
}

Modal.propTypes = {
    active: PropTypes.bool,
    id: PropTypes.string
}

export const ModalContent = props => {

    const contentRef = useRef(null);

    const closeModal = () => {
        contentRef.current.parentNode.classList.remove('!opacity-100');
        contentRef.current.parentNode.classList.remove('!visible');
        if (props.onClose) props.onClose();
    }

    return (
        <div ref={contentRef} className="p-8 bg-body w-full md:w-1/2 opacity-0 -translate-y-[250px] transition-all duration-600 ease-in-out relative group-active:!opacity-100 group-active:!translate-y-0" style={{ transform: props.onClose ? undefined : 'none' }}>
            <div className="modal__content__inner relative">
                {props.children}
                <div className="absolute right-[-15px] top-[-15px] text-[1.5rem] cursor-pointer hover:text-main" onClick={closeModal}>
                    <i className="bx bx-x"></i>
                </div>
            </div>
        </div>
    )
}

export default Modal;
