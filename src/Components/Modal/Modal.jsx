import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Modal.css';

const Modal = ({ isOpen, ToggleModal, title, children, footer, isLoading }) => {

    const handleModalClose = () => {
        ToggleModal(!isOpen);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="out-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div className="modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="modal-dialog"
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ duration: 0.3 }}

                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5">{title}</h1>
                                    <button type="button" className="btn-close" onClick={handleModalClose}></button>
                                </div>
                                <div className="modal-body">
                                    {isLoading ?
                                        <div className='w-100 centrar'>
                                            <div class="spinner-border text-secondary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                        :
                                        children
                                    }
                                </div>
                                <div className="modal-footer" >
                                    {footer}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>



            )}
        </AnimatePresence>
    );
};

export default Modal;
