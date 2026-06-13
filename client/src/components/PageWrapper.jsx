import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children, title, subtitle }) => {
  return (
    <div className="page-wrapper min-h-screen py-12">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            {title && <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-4">{title}</h1>}
            {subtitle && <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
