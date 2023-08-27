import { z } from 'zod';

export const chatMessageSchema = z.object({
	id: z.string(),
	name: z.string(),
	content: z.string(),
	timestamp: z.coerce.date()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;