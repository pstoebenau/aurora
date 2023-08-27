import { PRIVATE_OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';

export const openai = new OpenAI({
	apiKey: PRIVATE_OPENAI_API_KEY,
});
