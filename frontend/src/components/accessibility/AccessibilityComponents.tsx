'use client';

import { cn } from '@/lib/utils/cn';
import { useSkipToContent } from '@/hooks/useAccessibility';

interface SkipLinkProps {
    mainContentId?: string;
    text?: string;
    className?: string;
}

// Link para pular ao conteúdo principal (visível apenas com Tab)
export function SkipLink({
    mainContentId = 'main-content',
    text = 'Pular para o conteúdo principal',
    className,
}: SkipLinkProps) {
    const skipToMain = useSkipToContent(mainContentId);

    return (
        <a
            href={`#${mainContentId}`}
            onClick={(e) => {
                e.preventDefault();
                skipToMain();
            }}
            className={cn(
                'sr-only focus:not-sr-only',
                'focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
                'focus:px-4 focus:py-2 focus:rounded-lg',
                'focus:bg-primary-600 focus:text-white',
                'focus:font-medium focus:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'transition-all',
                className
            )}
        >
            {text}
        </a>
    );
}

interface VisuallyHiddenProps {
    children: React.ReactNode;
    asChild?: boolean;
}

// Conteúdo visualmente oculto, acessível para leitores de tela
export function VisuallyHidden({ children, asChild }: VisuallyHiddenProps) {
    return (
        <span
            className={cn(
                'absolute w-px h-px p-0 -m-px overflow-hidden',
                'whitespace-nowrap border-0',
                '[clip:rect(0,0,0,0)]'
            )}
        >
            {children}
        </span>
    );
}

interface LiveRegionProps {
    children: React.ReactNode;
    priority?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all';
}

// Região para anúncios dinâmicos a leitores de tela
export function LiveRegion({
    children,
    priority = 'polite',
    atomic = true,
    relevant = 'additions',
}: LiveRegionProps) {
    return (
        <div
            aria-live={priority}
            aria-atomic={atomic}
            aria-relevant={relevant}
            className="sr-only"
        >
            {children}
        </div>
    );
}

interface FocusRingProps {
    visible?: boolean;
    variant?: 'primary' | 'error' | 'success' | 'warning';
    className?: string;
}

// Retorna classes CSS de indicador de foco (focus ring)
export function getFocusRingClasses({
    visible = true,
    variant = 'primary',
}: FocusRingProps = {}): string {
    if (!visible) return '';

    const variantClasses = {
        primary: 'focus:ring-primary-500 focus:border-primary-500',
        error: 'focus:ring-red-500 focus:border-red-500',
        success: 'focus:ring-green-500 focus:border-green-500',
        warning: 'focus:ring-yellow-500 focus:border-yellow-500',
    };

    return cn(
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'dark:focus:ring-offset-dark-bg',
        variantClasses[variant]
    );
}

// Cores acessíveis que atendem WCAG AA
export const accessibleColors = {
    text: {
        primary: 'text-gray-900 dark:text-gray-50',
        secondary: 'text-gray-700 dark:text-gray-200',
        muted: 'text-gray-600 dark:text-gray-300',
        error: 'text-red-700 dark:text-red-300',
        success: 'text-green-700 dark:text-green-300',
        warning: 'text-yellow-700 dark:text-yellow-300',
    },
    background: {
        error: 'bg-red-100 dark:bg-red-900/40',
        success: 'bg-green-100 dark:bg-green-900/40',
        warning: 'bg-yellow-100 dark:bg-yellow-900/40',
        info: 'bg-blue-100 dark:bg-blue-900/40',
    },
};

interface HeadingProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: React.ReactNode;
    className?: string;
    id?: string;
}

// Heading semântico com hierarquia correta
export function Heading({ level, children, className, id }: HeadingProps) {
    const sizeClasses = {
        1: 'text-3xl md:text-4xl font-bold',
        2: 'text-2xl md:text-3xl font-bold',
        3: 'text-xl md:text-2xl font-semibold',
        4: 'text-lg md:text-xl font-semibold',
        5: 'text-base md:text-lg font-medium',
        6: 'text-sm md:text-base font-medium',
    };

    const headingClass = cn(
        'text-gray-900 dark:text-white',
        sizeClasses[level],
        className
    );

    switch (level) {
        case 1:
            return <h1 id={id} className={headingClass}>{children}</h1>;
        case 2:
            return <h2 id={id} className={headingClass}>{children}</h2>;
        case 3:
            return <h3 id={id} className={headingClass}>{children}</h3>;
        case 4:
            return <h4 id={id} className={headingClass}>{children}</h4>;
        case 5:
            return <h5 id={id} className={headingClass}>{children}</h5>;
        case 6:
            return <h6 id={id} className={headingClass}>{children}</h6>;
    }
}

export function getAriaLabel(action: string, context?: string): string {
    return context ? `${action}, ${context}` : action;
}
