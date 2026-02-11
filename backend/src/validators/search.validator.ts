import { z } from 'zod';

export const searchMessagesSchema = z.object({
    query: z.string().min(1, 'Query cannot be empty'),
    conversationId: z.string().uuid().optional(),
    senderId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.enum(['relevance', 'date']).optional(),
});

export const searchUsersSchema = z.object({
    query: z.string().min(1, 'Query cannot be empty'),
    page: z.string().optional(),
    limit: z.string().optional(),
});
