import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function CountUp({
    value = 0,
    duration = 2,
    className = "",
    prefix = "",
    suffix = "",
    decimals = 0
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const nodeRef = useRef(null);

    const spring = useSpring(0, {
        mass: 0.8,
        stiffness: 75,
        damping: 15,
        duration: duration * 1000
    });

    const display = useTransform(spring, (current) =>
        Math.floor(current * (10 ** decimals)) / (10 ** decimals)
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    useEffect(() => {
        const unsubscribe = display.on('change', (latest) => {
            setDisplayValue(latest);
        });

        return () => unsubscribe();
    }, [display]);

    const formattedValue = decimals > 0
        ? displayValue.toFixed(decimals)
        : Math.floor(displayValue).toLocaleString();

    return (
        <span ref={nodeRef} className={className}>
            {prefix}{formattedValue}{suffix}
        </span>
    );
}
