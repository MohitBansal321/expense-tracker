import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedList({ children, className = "" }) {
    const childrenArray = React.Children.toArray(children);

    return (
        <div className={className}>
            <AnimatePresence mode="popLayout">
                {childrenArray.map((child, index) => (
                    <motion.div
                        key={child.key || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: "easeOut"
                        }}
                    >
                        {child}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
