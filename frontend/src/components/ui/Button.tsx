import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            fullWidth = false,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary:
                'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-300 dark:focus:ring-primary-500',
            secondary:
                'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
            ghost:
                'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-dark-hover dark:active:bg-dark-card',
            danger:
                'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-300 dark:focus:ring-red-500',
            success:
                'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-300 dark:focus:ring-green-500',
            outline:
                'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-dark-hover dark:active:bg-dark-card',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm h-8',
            md: 'px-4 py-2 text-base h-10',
            lg: 'px-6 py-3 text-lg h-12',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
