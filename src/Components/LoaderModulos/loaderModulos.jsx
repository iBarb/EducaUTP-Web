import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const LoaderModulos = () => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='loader-centrar'>
                <span className="loader_calendar"></span>
            </motion.div>
        </AnimatePresence>
    );
}

export default LoaderModulos;
