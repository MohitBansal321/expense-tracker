import React from 'react';
import { motion } from 'framer-motion';

export function ElectricBorder({
    children,
    className = "",
    borderColor = "rgba(59, 130, 246, 0.5)",
    glowColor = "rgba(59, 130, 246, 0.3)"
}) {
    return (
        <div className={`relative ${className}`}>
            {/* Animated border */}
            <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                    background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
                    backgroundSize: '200% 100%',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-lg blur-md"
                style={{
                    background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
                    backgroundSize: '200% 100%',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
