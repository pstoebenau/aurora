import AIChat from '$lib/services/AIChat/AIChat';
import { chatMessageSchema } from '$lib/types/Chat/ChatMessage';
import type { RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

export const POST: RequestHandler = async ({ request }) => {
	const messageArrRaw = await request.json();
	const messageArr = z.array(chatMessageSchema).parse(messageArrRaw);

	const aiChat = new AIChat();
	const stream = await aiChat.chat(messageArr);

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream'
		}
	});
};
