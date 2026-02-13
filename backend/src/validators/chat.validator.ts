import { z } from 'zod';

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(1, 'At least one participant is required'),
  isGroup: z.boolean().optional().default(false),
  name: z.string().min(1).optional(),
});

export const getMessagesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
