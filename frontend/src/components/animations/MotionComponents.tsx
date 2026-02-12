'use client';

import { motion, AnimatePresence, Variants, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Variantes de animação

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const slideInFromBottom: Variants = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
};

export const slideInFromRight: Variants = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
};

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};

// Componentes animados

interface FadeInProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.3,
    direction = 'none',
    className,
    ...props
}: FadeInProps) {
    const prefersReducedMotion = useReducedMotion();

    const variants: Record<string, Variants> = {
        up: fadeInUp,
        down: fadeInDown,
        left: fadeInLeft,
        right: fadeInRight,
        none: fadeIn,
    };

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants[direction]}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface ScaleInProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
}

export function ScaleIn({
    children,
    delay = 0,
    duration = 0.2,
    className,
    ...props
}: ScaleInProps) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={scaleIn}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggerListProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    staggerDelay?: number;
}

export function StaggerList({
    children,
    staggerDelay = 0.1,
    className,
    ...props
}: StaggerListProps) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={{
                initial: {},
                animate: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
}

// Item individual para StaggerList
export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            variants={staggerItem}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface SlideInProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    direction?: 'bottom' | 'right' | 'left' | 'top';
    duration?: number;
}

export function SlideIn({
    children,
    direction = 'bottom',
    duration = 0.3,
    className,
    ...props
}: SlideInProps) {
    const prefersReducedMotion = useReducedMotion();

    const variants: Record<string, Variants> = {
        bottom: slideInFromBottom,
        right: slideInFromRight,
        left: {
            initial: { x: '-100%' },
            animate: { x: 0 },
            exit: { x: '-100%' },
        },
        top: {
            initial: { y: '-100%' },
            animate: { y: 0 },
            exit: { y: '-100%' },
        },
    };

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants[direction]}
            transition={{ duration, ease: 'easeOut' }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Transição de página

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animação de pulso

interface PulseProps {
    children: React.ReactNode;
    className?: string;
    duration?: number;
}

export function Pulse({ children, className, duration = 2 }: PulseProps) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            animate={{
                scale: [1, 1.02, 1],
                opacity: [1, 0.8, 1],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animação de bounce

interface BounceProps {
    children: React.ReactNode;
    className?: string;
}

export function Bounce({ children, className }: BounceProps) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 15,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export { AnimatePresence };
