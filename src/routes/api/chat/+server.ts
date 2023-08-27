import AIChat from '$lib/services/AIChat/AIChat';
import { chatMessageSchema } from '$lib/types/Chat/ChatMessage';
import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

export const POST: RequestHandler = async ({ request }) => {
	const messageArrRaw = await request.json();
	const messageArr = z.array(chatMessageSchema).parse(messageArrRaw);

	const aiChat = new AIChat();
	const messageReply = await aiChat.chat(messageArr);

	return json(messageReply);
};
