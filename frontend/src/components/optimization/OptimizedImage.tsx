'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallbackSrc?: string;
    showSkeleton?: boolean;
    aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2' | 'auto';
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    auto: '',
};

export function OptimizedImage({
    src,
    alt,
    fallbackSrc = '/images/placeholder.png',
    showSkeleton = true,
    aspectRatio = 'auto',
    objectFit = 'cover',
    className,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
        setError(true);
        setIsLoading(false);
    }, []);

    const imageSrc = error ? fallbackSrc : src;

    return (
        <div
            className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}
            role="img"
            aria-label={alt}
        >
            {/* Skeleton de carregamento */}
            {showSkeleton && isLoading && (
                <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Imagem */}
            <Image
                src={imageSrc}
                alt={alt}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100',
                    objectFit === 'cover' && 'object-cover',
                    objectFit === 'contain' && 'object-contain',
                    objectFit === 'fill' && 'object-fill',
                    objectFit === 'none' && 'object-none'
                )}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
}

// Componente de avatar otimizado

interface AvatarImageProps {
    src?: string | null;
    alt: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fallbackInitials?: string;
}

const avatarSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
};

const avatarSizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
};

export function AvatarImage({
    src,
    alt,
    size = 'md',
    className,
    fallbackInitials,
}: AvatarImageProps) {
    const [error, setError] = useState(false);

    const initials =
        fallbackInitials ||
        alt
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    if (!src || error) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center rounded-full bg-primary/10 font-medium text-primary',
                    avatarSizeClasses[size],
                    className
                )}
                role="img"
                aria-label={alt}
            >
                {initials}
            </div>
        );
    }

    return (
        <div className={cn('relative overflow-hidden rounded-full', avatarSizeClasses[size], className)}>
            <Image
                src={src}
                alt={alt}
                width={avatarSizes[size]}
                height={avatarSizes[size]}
                className="h-full w-full object-cover"
                onError={() => setError(true)}
            />
        </div>
    );
}

// Componente de imagem de fundo

interface BackgroundImageProps {
    src: string;
    alt: string;
    children?: React.ReactNode;
    className?: string;
    overlay?: boolean;
    overlayOpacity?: number;
}

export function BackgroundImage({
    src,
    alt,
    children,
    className,
    overlay = true,
    overlayOpacity = 0.5,
}: BackgroundImageProps) {
    return (
        <div className={cn('relative overflow-hidden', className)}>
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                priority={false}
                quality={75}
            />
            {overlay && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: overlayOpacity }}
                    aria-hidden="true"
                />
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
}

// Gera placeholder com efeito shimmer

export function generateBlurPlaceholder(width: number, height: number): string {
    const shimmer = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="20%" />
          <stop stop-color="#e5e7eb" offset="50%" />
          <stop stop-color="#f3f4f6" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f3f4f6" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `;

    return `data:image/svg+xml;base64,${Buffer.from(shimmer).toString('base64')}`;
}
