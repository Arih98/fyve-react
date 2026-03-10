import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSharedTransition } from './SharedTransitionContext';
import './SharedTransitionLayer.css';

const SharedTransitionLayer = () => {
  const { transition, clearTransition } = useSharedTransition();

  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          key={transition.id}
          className="shared-transition-overlay"
          initial={{
            left: transition.sourceRect.left,
            top: transition.sourceRect.top,
            width: transition.sourceRect.width,
            height: transition.sourceRect.height,
            opacity: 1
          }}
          animate={{
            left: transition.destinationRect ? transition.destinationRect.left : transition.sourceRect.left,
            top: transition.destinationRect ? transition.destinationRect.top : transition.sourceRect.top,
            width: transition.destinationRect ? transition.destinationRect.width : transition.sourceRect.width,
            height: transition.destinationRect ? transition.destinationRect.height : transition.sourceRect.height,
            opacity: 1
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => {
            if (transition.destinationRect) {
              clearTransition(transition.id);
            }
          }}
        >
          <img
            src={transition.imageSrc}
            alt={transition.title || ''}
            className="shared-transition-overlay-image"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharedTransitionLayer;