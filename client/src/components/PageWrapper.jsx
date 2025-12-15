import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Custom bezier for "smooth" feel
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;
