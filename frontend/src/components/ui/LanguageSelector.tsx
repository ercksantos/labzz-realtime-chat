'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

// Define locales locally to avoid importing from server-only file
const locales = ['pt-BR', 'en-US'] as const;
type Locale = (typeof locales)[number];

const localeNames: Record<Locale, string> = {
    'pt-BR': 'Português (Brasil)',
    'en-US': 'English (US)',
};

const localeFlags: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en-US': '🇺🇸',
};

interface LanguageSelectorProps {
    className?: string;
    variant?: 'dropdown' | 'buttons';
}

export function LanguageSelector({ className, variant = 'dropdown' }: LanguageSelectorProps) {
    const locale = useLocale() as Locale;
    const t = useTranslations('language');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleChangeLocale = async (newLocale: Locale) => {
        // Set locale cookie
        document.cookie = `locale=${newLocale};path=/;max-age=31536000`; // 1 year

        // Reload the page to apply the new locale
        window.location.reload();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (variant === 'buttons') {
        return (
            <div className={cn('flex gap-2', className)}>
                {locales.map((loc) => (
                    <button
                        key={loc}
                        onClick={() => handleChangeLocale(loc)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                            locale === loc
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        )}
                    >
                        <span className="text-lg">{localeFlags[loc]}</span>
                        <span className="text-sm font-medium">{localeNames[loc]}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className={cn('relative', className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    'bg-gray-100 dark:bg-gray-800',
                    'hover:bg-gray-200 dark:hover:bg-gray-700',
                    'text-gray-700 dark:text-gray-300',
                    'transition-colors'
                )}
                aria-label={t('select')}
            >
                <span className="text-lg">{localeFlags[locale]}</span>
                <span className="text-sm font-medium hidden sm:inline">{localeNames[locale]}</span>
                <svg
                    className={cn(
                        'w-4 h-4 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className={cn(
                        'absolute right-0 mt-2 w-48 rounded-lg',
                        'bg-white dark:bg-dark-card',
                        'border border-gray-200 dark:border-gray-700',
                        'shadow-lg',
                        'py-1 z-50'
                    )}
                >
                    {locales.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => {
                                handleChangeLocale(loc);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-2',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                'transition-colors text-left',
                                locale === loc
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-gray-300'
                            )}
                        >
                            <span className="text-lg">{localeFlags[loc]}</span>
                            <span className="text-sm font-medium">{localeNames[loc]}</span>
                            {locale === loc && (
                                <svg
                                    className="w-4 h-4 ml-auto text-primary-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
