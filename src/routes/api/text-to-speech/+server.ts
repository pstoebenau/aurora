import { PRIVATE_ELEVEN_LABS_API_KEY } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";
import voice from "elevenlabs-node";

export const POST: RequestHandler = async ({ request }) => {
    const { text } = await request.json();

    const stream: ReadableStream = await voice.textToSpeechStream(
        PRIVATE_ELEVEN_LABS_API_KEY,
        'kgQJuyv8GXv3XqLkSsZP',
        text,
        0.5,
        0.75,
        "eleven_multilingual_v2",
    );

    return new Response(stream, {
        headers: {
            "content-type": "audio/mpeg",
        }
    });
}

