import { renderHook, act, waitFor } from '@testing-library/react';
import { useCache, useCacheList, cacheUtils } from '@/hooks/useCache';

describe('useCache', () => {
    beforeEach(() => {
        cacheUtils.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Basic Functionality', () => {
        it('fetches data successfully', async () => {
            const fetcher = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });

            const { result } = renderHook(() => useCache('test-key', fetcher));

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual({ id: 1, name: 'Test' });
            expect(result.current.error).toBeNull();
        });

        it('handles fetch errors', async () => {
            const error = new Error('Fetch failed');
            const fetcher = jest.fn().mockRejectedValue(error);

            const { result } = renderHook(() => useCache('error-key', fetcher));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toEqual(error);
            expect(result.current.data).toBeUndefined();
        });

        it('does not fetch when key is null', () => {
            const fetcher = jest.fn().mockResolvedValue('data');

            renderHook(() => useCache(null, fetcher));

            expect(fetcher).not.toHaveBeenCalled();
        });
    });

    describe('Caching Behavior', () => {
        it('uses cached data on subsequent requests', async () => {
            const fetcher = jest.fn().mockResolvedValue('cached-data');

            const { result: result1 } = renderHook(() => useCache('cache-test', fetcher));

            await waitFor(() => {
                expect(result1.current.data).toBe('cached-data');
            });

            expect(fetcher).toHaveBeenCalledTimes(1);

            // Second render should use cache
            const { result: result2 } = renderHook(() => useCache('cache-test', fetcher));

            expect(result2.current.data).toBe('cached-data');
            // Fetcher is called again for revalidation in stale-while-revalidate
        });

        it('returns stale data while revalidating', async () => {
            const fetcher = jest.fn()
                .mockResolvedValueOnce('initial')
                .mockResolvedValueOnce('updated');

            const { result } = renderHook(() =>
                useCache('stale-key', fetcher, { staleWhileRevalidate: true })
            );

            await waitFor(() => {
                expect(result.current.data).toBe('initial');
            });

            // Trigger refetch
            act(() => {
                result.current.refetch();
            });

            // Should still have old data while validating
            expect(result.current.data).toBe('initial');
            expect(result.current.isValidating).toBe(true);

            await waitFor(() => {
                expect(result.current.data).toBe('updated');
            });
        });
    });

    describe('Cache Options', () => {
        it('respects TTL option', async () => {
            const fetcher = jest.fn().mockResolvedValue('data');

            const { result } = renderHook(() =>
                useCache('ttl-key', fetcher, { ttl: 1000 })
            );

            await waitFor(() => {
                expect(result.current.data).toBe('data');
            });

            // Cache should be valid
            expect(cacheUtils.has('ttl-key')).toBe(true);

            // Advance time past TTL
            act(() => {
                jest.advanceTimersByTime(1100);
            });

            // Cache should be expired
            expect(cacheUtils.has('ttl-key')).toBe(false);
        });

        it('calls onSuccess callback', async () => {
            const onSuccess = jest.fn();
            const fetcher = jest.fn().mockResolvedValue({ success: true });

            renderHook(() =>
                useCache('success-key', fetcher, { onSuccess })
            );

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith({ success: true });
            });
        });

        it('calls onError callback', async () => {
            const onError = jest.fn();
            const error = new Error('Failed');
            const fetcher = jest.fn().mockRejectedValue(error);

            renderHook(() =>
                useCache('error-callback-key', fetcher, { onError })
            );

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(error);
            });
        });

        it('uses initial data', () => {
            const fetcher = jest.fn().mockResolvedValue('fetched');

            const { result } = renderHook(() =>
                useCache('initial-key', fetcher, { initialData: 'initial' })
            );

            expect(result.current.data).toBe('initial');
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('Mutate Function', () => {
        it('mutates data directly', async () => {
            const fetcher = jest.fn().mockResolvedValue('original');

            const { result } = renderHook(() => useCache('mutate-key', fetcher));

            await waitFor(() => {
                expect(result.current.data).toBe('original');
            });

            act(() => {
                result.current.mutate('mutated');
            });

            expect(result.current.data).toBe('mutated');
        });

        it('mutates data with updater function', async () => {
            const fetcher = jest.fn().mockResolvedValue({ count: 1 });

            const { result } = renderHook(() =>
                useCache<{ count: number }>('updater-key', fetcher)
            );

            await waitFor(() => {
                expect(result.current.data).toEqual({ count: 1 });
            });

            act(() => {
                result.current.mutate((current) => ({ count: (current?.count || 0) + 1 }));
            });

            expect(result.current.data).toEqual({ count: 2 });
        });

        it('refetches when mutate is called without arguments', async () => {
            const fetcher = jest.fn()
                .mockResolvedValueOnce('first')
                .mockResolvedValueOnce('second');

            const { result } = renderHook(() => useCache('refetch-key', fetcher));

            await waitFor(() => {
                expect(result.current.data).toBe('first');
            });

            act(() => {
                result.current.mutate();
            });

            await waitFor(() => {
                expect(result.current.data).toBe('second');
            });

            expect(fetcher).toHaveBeenCalledTimes(2);
        });
    });
});

describe('cacheUtils', () => {
    beforeEach(() => {
        cacheUtils.clear();
    });

    it('invalidates specific key', async () => {
        const fetcher = jest.fn().mockResolvedValue('data');

        const { result } = renderHook(() => useCache('invalidate-key', fetcher));

        await waitFor(() => {
            expect(result.current.data).toBe('data');
        });

        expect(cacheUtils.has('invalidate-key')).toBe(true);

        cacheUtils.invalidate('invalidate-key');

        expect(cacheUtils.has('invalidate-key')).toBe(false);
    });

    it('invalidates keys by prefix', async () => {
        const fetcher = jest.fn().mockResolvedValue('data');

        renderHook(() => useCache('prefix:key1', fetcher));
        renderHook(() => useCache('prefix:key2', fetcher));
        renderHook(() => useCache('other:key', fetcher));

        await waitFor(() => {
            expect(cacheUtils.size()).toBeGreaterThan(0);
        });

        cacheUtils.invalidatePrefix('prefix:');

        expect(cacheUtils.has('prefix:key1')).toBe(false);
        expect(cacheUtils.has('prefix:key2')).toBe(false);
    });

    it('clears all cache', async () => {
        const fetcher = jest.fn().mockResolvedValue('data');

        renderHook(() => useCache('clear1', fetcher));
        renderHook(() => useCache('clear2', fetcher));

        await waitFor(() => {
            expect(cacheUtils.size()).toBeGreaterThan(0);
        });

        cacheUtils.clear();

        expect(cacheUtils.size()).toBe(0);
    });
});

describe('useCacheList', () => {
    beforeEach(() => {
        cacheUtils.clear();
    });

    it('fetches paginated data', async () => {
        const fetcher = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);

        const { result } = renderHook(() =>
            useCacheList('list-key', fetcher, { pageSize: 10 })
        );

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2);
        });

        expect(fetcher).toHaveBeenCalledWith(1, 10);
    });

    it('loads more data', async () => {
        const fetcher = jest.fn()
            .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
            .mockResolvedValueOnce([{ id: 3 }, { id: 4 }]);

        const { result } = renderHook(() =>
            useCacheList('list-more', fetcher, { pageSize: 2 })
        );

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2);
        });

        await act(async () => {
            await result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.data).toHaveLength(4);
        });
    });

    it('detects no more data', async () => {
        const fetcher = jest.fn().mockResolvedValue([{ id: 1 }]); // Less than pageSize

        const { result } = renderHook(() =>
            useCacheList('list-end', fetcher, { pageSize: 10 })
        );

        await waitFor(() => {
            expect(result.current.hasMore).toBe(false);
        });
    });

    it('resets list data', async () => {
        const fetcher = jest.fn()
            .mockResolvedValueOnce([{ id: 1 }])
            .mockResolvedValueOnce([{ id: 2 }]);

        const { result } = renderHook(() =>
            useCacheList('list-reset', fetcher, { pageSize: 1 })
        );

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1);
        });

        await act(async () => {
            await result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2);
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.data).toHaveLength(0);
    });
});
