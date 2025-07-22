import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ onComplete }) => (
  <motion.div
    initial={{ y: '-100%', opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: '100%', opacity: 0 }}
    transition={{ duration: 0.5 }}
    onAnimationComplete={onComplete}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <img src="/favicon.ico" alt="Logo" />
  </motion.div>
);

export default Loading;