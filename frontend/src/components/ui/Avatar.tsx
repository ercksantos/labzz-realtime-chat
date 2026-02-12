import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps {
    src?: string;
    alt: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    isOnline?: boolean;
    className?: string;
    showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    size = 'md',
    isOnline,
    className,
    showBorder = false,
}) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-24 h-24 text-2xl',
        '2xl': 'w-32 h-32 text-3xl',
    };

    const onlineIndicatorSizes = {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
        xl: 'w-5 h-5',
        '2xl': 'w-6 h-6',
    };

    // Gerar iniciais do nome
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = getInitials(alt);

    // Gerar cor consistente baseada no nome
    const getColorFromName = (name: string): string => {
        const colors = [
            'from-blue-400 to-blue-600',
            'from-green-400 to-green-600',
            'from-purple-400 to-purple-600',
            'from-pink-400 to-pink-600',
            'from-indigo-400 to-indigo-600',
            'from-red-400 to-red-600',
            'from-yellow-400 to-yellow-600',
            'from-teal-400 to-teal-600',
        ];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const gradientColor = getColorFromName(alt);

    return (
        <div className={cn('relative inline-block', className)}>
            <div
                className={cn(
                    sizes[size],
                    'rounded-full overflow-hidden',
                    'flex items-center justify-center text-white font-semibold',
                    !src && `bg-gradient-to-br ${gradientColor}`,
                    showBorder && 'ring-2 ring-white dark:ring-dark-bg ring-offset-2',
                    'transition-all duration-200'
                )}
            >
                {src ? (
                    <Image
                        src={src}
                        alt={alt}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="select-none">{initials}</span>
                )}
            </div>
            {isOnline !== undefined && (
                <div
                    className={cn(
                        onlineIndicatorSizes[size],
                        'absolute bottom-0 right-0',
                        'rounded-full border-2 border-white dark:border-dark-bg',
                        isOnline ? 'bg-green-500' : 'bg-gray-400',
                        'transition-colors duration-200'
                    )}
                    aria-label={isOnline ? 'Online' : 'Offline'}
                    title={isOnline ? 'Online' : 'Offline'}
                />
            )}
        </div>
    );
};
