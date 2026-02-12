'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
    /**
     * Whether the focus trap is active
     */
    isActive?: boolean;
    /**
     * Initial element to focus when trap is activated
     */
    initialFocus?: 'first' | 'last' | React.RefObject<HTMLElement>;
    /**
     * Return focus to the previously focused element on deactivation
     */
    returnFocusOnDeactivate?: boolean;
    /**
     * Called when user presses Escape
     */
    onEscape?: () => void;
}

/**
 * Hook to trap focus within a container for accessibility
 * Useful for modals, dialogs, and dropdown menus
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
    options: UseFocusTrapOptions = {}
) {
    const {
        isActive = true,
        initialFocus = 'first',
        returnFocusOnDeactivate = true,
        onEscape,
    } = options;

    const containerRef = useRef<T>(null);
    const previousActiveElement = useRef<Element | null>(null);

    // Get all focusable elements within the container
    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
        ].join(', ');

        return Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => {
            // Filter out hidden elements
            return el.offsetParent !== null;
        });
    }, []);

    // Focus the initial element
    const focusInitialElement = useCallback(() => {
        const focusableElements = getFocusableElements();

        if (typeof initialFocus === 'object' && initialFocus.current) {
            initialFocus.current.focus();
        } else if (initialFocus === 'last' && focusableElements.length > 0) {
            focusableElements[focusableElements.length - 1].focus();
        } else if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }, [getFocusableElements, initialFocus]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isActive || !containerRef.current) return;

            // Handle Escape key
            if (event.key === 'Escape' && onEscape) {
                event.preventDefault();
                onEscape();
                return;
            }

            // Handle Tab key for focus trapping
            if (event.key === 'Tab') {
                const focusableElements = getFocusableElements();
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        },
        [isActive, getFocusableElements, onEscape]
    );

    useEffect(() => {
        if (!isActive) return;

        // Store the previously focused element
        previousActiveElement.current = document.activeElement;

        // Focus the initial element
        focusInitialElement();

        // Add keyboard listener
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);

            // Return focus to the previous element
            if (returnFocusOnDeactivate && previousActiveElement.current) {
                (previousActiveElement.current as HTMLElement).focus?.();
            }
        };
    }, [isActive, focusInitialElement, handleKeyDown, returnFocusOnDeactivate]);

    return containerRef;
}

/**
 * Hook to handle keyboard navigation in lists
 */
export function useArrowNavigation<T extends HTMLElement = HTMLElement>(
    itemCount: number,
    options: {
        orientation?: 'vertical' | 'horizontal' | 'both';
        loop?: boolean;
        onSelect?: (index: number) => void;
    } = {}
) {
    const { orientation = 'vertical', loop = true, onSelect } = options;
    const currentIndex = useRef(0);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<T>) => {
            const { key } = event;
            let nextIndex = currentIndex.current;
            let handled = false;

            // Vertical navigation
            if (orientation === 'vertical' || orientation === 'both') {
                if (key === 'ArrowDown') {
                    nextIndex = currentIndex.current + 1;
                    handled = true;
                } else if (key === 'ArrowUp') {
                    nextIndex = currentIndex.current - 1;
                    handled = true;
                }
            }

            // Horizontal navigation
            if (orientation === 'horizontal' || orientation === 'both') {
                if (key === 'ArrowRight') {
                    nextIndex = currentIndex.current + 1;
                    handled = true;
                } else if (key === 'ArrowLeft') {
                    nextIndex = currentIndex.current - 1;
                    handled = true;
                }
            }

            // Handle Home and End keys
            if (key === 'Home') {
                nextIndex = 0;
                handled = true;
            } else if (key === 'End') {
                nextIndex = itemCount - 1;
                handled = true;
            }

            // Handle Enter and Space for selection
            if (key === 'Enter' || key === ' ') {
                event.preventDefault();
                onSelect?.(currentIndex.current);
                return;
            }

            if (handled) {
                event.preventDefault();

                // Handle loop
                if (loop) {
                    if (nextIndex < 0) nextIndex = itemCount - 1;
                    if (nextIndex >= itemCount) nextIndex = 0;
                } else {
                    nextIndex = Math.max(0, Math.min(itemCount - 1, nextIndex));
                }

                currentIndex.current = nextIndex;
            }
        },
        [itemCount, loop, onSelect, orientation]
    );

    const setCurrentIndex = useCallback((index: number) => {
        currentIndex.current = index;
    }, []);

    return {
        currentIndex: currentIndex.current,
        setCurrentIndex,
        handleKeyDown,
    };
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        // Create a live region if it doesn't exist
        let liveRegion = document.getElementById(`sr-live-${priority}`);

        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = `sr-live-${priority}`;
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            document.body.appendChild(liveRegion);
        }

        // Clear and set message (forces re-announcement)
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion!.textContent = message;
        }, 100);
    }, []);

    return announce;
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
    const mediaQuery = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    return mediaQuery?.matches ?? false;
}

/**
 * Hook to skip to main content
 */
export function useSkipToContent(mainContentId = 'main-content') {
    const skipToMain = useCallback(() => {
        const mainContent = document.getElementById(mainContentId);
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mainContentId]);

    return skipToMain;
}
