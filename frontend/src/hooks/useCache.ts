'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// Types
// ============================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface UseCacheOptions<T> {
    /** Time to live in milliseconds (default: 5 minutes) */
    ttl?: number;
    /** Stale while revalidate - return cached data while fetching new (default: true) */
    staleWhileRevalidate?: boolean;
    /** On success callback */
    onSuccess?: (data: T) => void;
    /** On error callback */
    onError?: (error: Error) => void;
    /** Initial data */
    initialData?: T;
    /** Refetch on window focus (default: true) */
    refetchOnFocus?: boolean;
    /** Refetch interval in ms (0 = disabled) */
    refetchInterval?: number;
    /** Dependencies that trigger refetch */
    deps?: unknown[];
}

interface UseCacheReturn<T> {
    data: T | undefined;
    error: Error | null;
    isLoading: boolean;
    isValidating: boolean;
    isStale: boolean;
    mutate: (data?: T | ((current: T | undefined) => T)) => void;
    refetch: () => Promise<void>;
}

// ============================================
// In-Memory Cache Store
// ============================================

const cacheStore = new Map<string, CacheEntry<unknown>>();

function getCacheEntry<T>(key: string): CacheEntry<T> | undefined {
    const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
    if (entry && Date.now() > entry.expiresAt) {
        cacheStore.delete(key);
        return undefined;
    }
    return entry;
}

function setCacheEntry<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    cacheStore.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl,
    });
}

// ============================================
// useCache Hook
// ============================================

export function useCache<T>(
    key: string | null,
    fetcher: () => Promise<T>,
    options: UseCacheOptions<T> = {}
): UseCacheReturn<T> {
    const {
        ttl = 5 * 60 * 1000, // 5 minutes
        staleWhileRevalidate = true,
        onSuccess,
        onError,
        initialData,
        refetchOnFocus = true,
        refetchInterval = 0,
        deps = [],
    } = options;

    const [data, setData] = useState<T | undefined>(() => {
        if (key) {
            const cached = getCacheEntry<T>(key);
            if (cached) return cached.data;
        }
        return initialData;
    });
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(!data);
    const [isValidating, setIsValidating] = useState(false);

    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const isStale = key ? !getCacheEntry<T>(key) : true;

    const fetchData = useCallback(async () => {
        if (!key) return;

        const cached = getCacheEntry<T>(key);

        // If we have cached data and staleWhileRevalidate is enabled, use it
        if (cached && staleWhileRevalidate) {
            setData(cached.data);
            setIsLoading(false);
        }

        setIsValidating(true);
        setError(null);

        try {
            const result = await fetcherRef.current();
            setCacheEntry(key, result, ttl);
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
        } finally {
            setIsLoading(false);
            setIsValidating(false);
        }
    }, [key, ttl, staleWhileRevalidate, onSuccess, onError]);

    // Initial fetch
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, ...deps]);

    // Refetch on window focus
    useEffect(() => {
        if (!refetchOnFocus) return;

        const handleFocus = () => {
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleFocus);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleFocus);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchData, refetchOnFocus]);

    // Refetch interval
    useEffect(() => {
        if (!refetchInterval || refetchInterval <= 0) return;

        const intervalId = setInterval(fetchData, refetchInterval);
        return () => clearInterval(intervalId);
    }, [fetchData, refetchInterval]);

    // Mutate function
    const mutate = useCallback(
        (newData?: T | ((current: T | undefined) => T)) => {
            if (!key) return;

            if (newData === undefined) {
                // Refetch
                fetchData();
            } else if (typeof newData === 'function') {
                const updater = newData as (current: T | undefined) => T;
                const updated = updater(data);
                setCacheEntry(key, updated, ttl);
                setData(updated);
            } else {
                setCacheEntry(key, newData, ttl);
                setData(newData);
            }
        },
        [key, data, ttl, fetchData]
    );

    return {
        data,
        error,
        isLoading,
        isValidating,
        isStale,
        mutate,
        refetch: fetchData,
    };
}

// ============================================
// useCacheList Hook (for paginated data)
// ============================================

interface UseCacheListOptions<T> extends UseCacheOptions<T[]> {
    pageSize?: number;
}

interface UseCacheListReturn<T> extends Omit<UseCacheReturn<T[]>, 'data'> {
    data: T[];
    hasMore: boolean;
    loadMore: () => Promise<void>;
    reset: () => void;
}

export function useCacheList<T>(
    key: string | null,
    fetcher: (page: number, pageSize: number) => Promise<T[]>,
    options: UseCacheListOptions<T> = {}
): UseCacheListReturn<T> {
    const { pageSize = 20, ...cacheOptions } = options;
    const [page, setPage] = useState(1);
    const [allData, setAllData] = useState<T[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const cacheKey = key ? `${key}:page:${page}` : null;

    const result = useCache(cacheKey, () => fetcher(page, pageSize), {
        ...cacheOptions,
        onSuccess: (pageData) => {
            if (page === 1) {
                setAllData(pageData);
            } else {
                setAllData((prev) => [...prev, ...pageData]);
            }
            setHasMore(pageData.length === pageSize);
            cacheOptions.onSuccess?.(pageData);
        },
    });

    const loadMore = useCallback(async () => {
        if (!hasMore || result.isLoading || result.isValidating) return;
        setPage((p) => p + 1);
    }, [hasMore, result.isLoading, result.isValidating]);

    const reset = useCallback(() => {
        setPage(1);
        setAllData([]);
        setHasMore(true);
    }, []);

    return {
        ...result,
        data: allData,
        hasMore,
        loadMore,
        reset,
    };
}

// ============================================
// Cache Utilities
// ============================================

export const cacheUtils = {
    /** Clear a specific cache entry */
    invalidate: (key: string) => {
        cacheStore.delete(key);
    },

    /** Clear all cache entries matching a prefix */
    invalidatePrefix: (prefix: string) => {
        for (const key of cacheStore.keys()) {
            if (key.startsWith(prefix)) {
                cacheStore.delete(key);
            }
        }
    },

    /** Clear all cache entries */
    clear: () => {
        cacheStore.clear();
    },

    /** Get cache size */
    size: () => cacheStore.size,

    /** Check if key exists and is not expired */
    has: (key: string) => {
        const entry = cacheStore.get(key);
        if (!entry) return false;
        if (Date.now() > (entry as CacheEntry<unknown>).expiresAt) {
            cacheStore.delete(key);
            return false;
        }
        return true;
    },
};
