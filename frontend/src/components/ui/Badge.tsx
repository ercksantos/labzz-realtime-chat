import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    dot = false,
}) => {
    const baseStyles =
        'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-200';

    const variants = {
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
        secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const dotVariants = {
        primary: 'bg-primary-500',
        secondary: 'bg-gray-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    return (
        <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
            {dot && (
                <span
                    className={cn('w-2 h-2 mr-1.5 rounded-full', dotVariants[variant])}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
};
