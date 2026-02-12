'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
    className?: string;
    /**
     * Shape variant
     */
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    /**
     * Width of the skeleton (CSS value)
     */
    width?: string | number;
    /**
     * Height of the skeleton (CSS value)
     */
    height?: string | number;
    /**
     * Enable shimmer animation
     */
    animate?: boolean;
}

/**
 * Skeleton loader component for loading states
 */
export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
    animate = true,
}: SkeletonProps) {
    const variantClasses = {
        text: 'h-4 w-full rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-lg',
    };

    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={cn(
                'bg-gray-200 dark:bg-gray-700',
                animate && 'animate-pulse',
                variantClasses[variant],
                className
            )}
            style={style}
            aria-hidden="true"
        />
    );
}

interface SkeletonTextProps {
    /**
     * Number of text lines
     */
    lines?: number;
    /**
     * Gap between lines
     */
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Multiple line skeleton text
 */
export function SkeletonText({ lines = 3, gap = 'md', className }: SkeletonTextProps) {
    const gapClasses = {
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-3',
    };

    return (
        <div className={cn(gapClasses[gap], className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    // Last line is shorter
                    className={index === lines - 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    );
}

interface SkeletonAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

/**
 * Avatar skeleton loader
 */
export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <Skeleton
            variant="circular"
            className={cn(sizeClasses[size], className)}
        />
    );
}

interface SkeletonButtonProps {
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
}

/**
 * Button skeleton loader
 */
export function SkeletonButton({ size = 'md', fullWidth, className }: SkeletonButtonProps) {
    const sizeClasses = {
        sm: 'h-8 w-20',
        md: 'h-10 w-28',
        lg: 'h-12 w-36',
    };

    return (
        <Skeleton
            variant="rounded"
            className={cn(sizeClasses[size], fullWidth && 'w-full', className)}
        />
    );
}

interface SkeletonCardProps {
    /**
     * Show avatar placeholder
     */
    showAvatar?: boolean;
    /**
     * Number of text lines
     */
    lines?: number;
    className?: string;
}

/**
 * Card skeleton loader
 */
export function SkeletonCard({ showAvatar = true, lines = 3, className }: SkeletonCardProps) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-dark-card rounded-lg p-4',
                'border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            {showAvatar && (
                <div className="flex items-center gap-3 mb-4">
                    <SkeletonAvatar />
                    <div className="flex-1">
                        <Skeleton variant="text" className="h-4 w-24 mb-1" />
                        <Skeleton variant="text" className="h-3 w-16" />
                    </div>
                </div>
            )}
            <SkeletonText lines={lines} />
        </div>
    );
}

interface SkeletonMessageProps {
    /**
     * Is this an outgoing message (right aligned)
     */
    isOutgoing?: boolean;
    className?: string;
}

/**
 * Chat message skeleton loader
 */
export function SkeletonMessage({ isOutgoing = false, className }: SkeletonMessageProps) {
    return (
        <div
            className={cn(
                'flex gap-2 mb-4',
                isOutgoing ? 'flex-row-reverse' : 'flex-row',
                className
            )}
        >
            {!isOutgoing && <SkeletonAvatar size="sm" />}
            <div
                className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    isOutgoing
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : 'bg-gray-100 dark:bg-gray-800'
                )}
            >
                <Skeleton variant="text" className="h-4 w-32 mb-1" />
                <Skeleton variant="text" className="h-4 w-24" />
            </div>
        </div>
    );
}

interface SkeletonConversationProps {
    className?: string;
}

/**
 * Conversation list item skeleton loader
 */
export function SkeletonConversation({ className }: SkeletonConversationProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'bg-gray-50 dark:bg-gray-800/50',
                className
            )}
        >
            <SkeletonAvatar size="lg" />
            <div className="flex-1 min-w-0">
                <Skeleton variant="text" className="h-4 w-32 mb-2" />
                <Skeleton variant="text" className="h-3 w-48" />
            </div>
            <Skeleton variant="text" className="h-3 w-10" />
        </div>
    );
}

interface SkeletonChatListProps {
    count?: number;
    className?: string;
}

/**
 * Chat list skeleton loader
 */
export function SkeletonChatList({ count = 5, className }: SkeletonChatListProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonConversation key={index} />
            ))}
        </div>
    );
}

interface SkeletonMessagesProps {
    count?: number;
    className?: string;
}

/**
 * Messages area skeleton loader
 */
export function SkeletonMessages({ count = 6, className }: SkeletonMessagesProps) {
    return (
        <div className={cn('space-y-4 p-4', className)}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonMessage key={index} isOutgoing={index % 3 === 0} />
            ))}
        </div>
    );
}
