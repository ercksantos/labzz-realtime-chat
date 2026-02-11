import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LoadingProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'md',
    variant = 'spinner',
    text,
    fullScreen = false,
    className,
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const Spinner = () => (
        <svg
            className={cn('animate-spin text-primary-500', sizes[size])}
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
    );

    const Dots = () => {
        const dotSizes = {
            sm: 'w-1.5 h-1.5',
            md: 'w-2 h-2',
            lg: 'w-3 h-3',
            xl: 'w-4 h-4',
        };

        return (
            <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            'rounded-full bg-primary-500 animate-bounce',
                            dotSizes[size]
                        )}
                        style={{
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '0.6s',
                        }}
                    />
                ))}
            </div>
        );
    };

    const Pulse = () => {
        const pulseSizes = {
            sm: 'w-8 h-8',
            md: 'w-12 h-12',
            lg: 'w-16 h-16',
            xl: 'w-20 h-20',
        };

        return (
            <div className={cn('relative', pulseSizes[size])}>
                <div className="absolute inset-0 rounded-full bg-primary-500 opacity-75 animate-ping" />
                <div className="relative rounded-full bg-primary-500 h-full w-full" />
            </div>
        );
    };

    const variants = {
        spinner: <Spinner />,
        dots: <Dots />,
        pulse: <Pulse />,
    };

    const content = (
        <div
            className={cn('flex flex-col items-center justify-center gap-3', className)}
            role="status"
            aria-live="polite"
            aria-label={text || 'Loading'}
        >
            {variants[variant]}
            {text && (
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
};
