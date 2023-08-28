<script lang="ts">
	import ChatBubble from '$lib/components/ChatBubble/ChatBubble.svelte';
	import Spinner from '$lib/components/Spinner/Spinner.svelte';
	import type { ChatMessage } from '$lib/types/Chat/ChatMessage';
	import { fade } from "svelte/transition";
	import { timeout } from '$lib/helpers/promise';
	import { tick } from 'svelte';

	let messages: ChatMessage[] = [];
	let currentMessage: string;
	let messageLoading = false;
	let audioStreamQueue: (ReadableStream | null)[] = [];
	let speechAudioElements: Record<string, HTMLAudioElement> = {};
	let audioChunkCount = 0;
	let audioChunkFetching = 0;

	async function sendMessage() {
		if (messageLoading) {
			return;
		}
		
		// Add human chat bubble
		messageLoading = true;
		messages = [...messages, {
			id: crypto.randomUUID(),
			content: currentMessage,
			name: "Subject X",
			timestamp: new Date(),
		}];
		
		// Add AI chat bubble
		const replyMessage: ChatMessage = {
			id: crypto.randomUUID(),
			content: "",
			name: "A.U.R.O.R.A",
			timestamp: new Date(),
		};
		messages = [...messages, replyMessage];
		
		// Clear user input
		currentMessage = "";
		
		// Setup media stream
		await tick();
		readAudioStreamQueue(speechAudioElements[replyMessage.id]);
		
		// Get chat stream
		const chatStream = await getChatStream(messages);
		// Stream message text to chat bubble
		const readerChat = chatStream.pipeThrough(new TextDecoderStream()).getReader();
		let currentSentence = "";
		audioChunkCount = 0;
		while (true) {
			const {value, done} = await readerChat.read();
			if (done) {
				if (currentSentence != "") {
					loadVoiceAudio(currentSentence, audioChunkCount++);
				}
				break;
			}
			replyMessage.content += value;
			messages = messages;
			const sentenceTerminatorRegex = /([.!?])/;
			// Stream voice for each sentence
			if (sentenceTerminatorRegex.test(value) && currentSentence.length > 50) {
				const split = value.split(sentenceTerminatorRegex)
				currentSentence += split[0] + split[1];
				loadVoiceAudio(currentSentence, audioChunkCount++);
				currentSentence = split[2].trim() ?? "";
			}
			else {
				currentSentence += value;
			}
		}

		messageLoading = false;
    }

	async function loadVoiceAudio(text: string, index: number) {
		audioStreamQueue[index] = null;
		
		// Limit number of request to 1 at a time
		while (index !== 0 && audioStreamQueue[index-1] == null) {
			await timeout(50);
		}
		
		// Get audio stream
		audioChunkFetching++;
		const audioStream = await getAudioStream(text);
		audioChunkFetching--;

		// Add to queue
		audioStreamQueue[index] = audioStream;
	}

	async function readAudioStreamQueue(audioEl: HTMLAudioElement) {
		const mediaSource = new MediaSource();
		audioEl.src = URL.createObjectURL(mediaSource);
		audioEl.play();
		await new Promise<void>(resolve => {
			mediaSource.addEventListener("sourceopen", () => resolve());
		});

		const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

		// Wait for first stream to come in
		while(audioStreamQueue.length === 0) {
			await timeout(50);
		}

		// Stream each audio stream chunk sequentially
		for(let currentIndex = 0; currentIndex < audioChunkCount; currentIndex++) {
			// Wait for stream to come in
			while(audioStreamQueue[currentIndex] == null) {
				console.log(currentIndex);
				await timeout(50);
			}

			console.log("Loading audio chunk " + currentIndex);
			
			// Enqueue
			const audioStream = audioStreamQueue[currentIndex] as ReadableStream;
			
			// Stream audio to buffer
			const readerAudio = audioStream.getReader();
			while (true) {
				const { done, value } = await readerAudio.read();
				if (done) break;
				
				sourceBuffer.appendBuffer(value);
				console.log("Appending audio data " + currentIndex);
				
				await new Promise(resolve => {
					sourceBuffer.addEventListener("updateend", resolve, { once: true });
				});
			}
		}

		audioChunkCount = 0
		audioStreamQueue = [];
		mediaSource.endOfStream();
	}

	async function getChatStream(messages: ChatMessage[]) {
		const chatMessages = messages.map(message => ({
			role: message.name === "A.U.R.O.R.A" ? "assistant" : "user",
			content: message.content,
		}));
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(chatMessages),
		});
		if (!response.body) {
			throw new Error("Failed to get chat stream.");
		}

		return response.body;
	}

	async function getAudioStream(text: string) {
		const response = await fetch('/api/text-to-speech', {
			method: 'POST',
			body: JSON.stringify({ text }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.body) {
			throw new Error("Failed to get audio stream.");
		}

		return response.body;
	}
</script>

<div class="container overflow-auto h-full mx-auto flex flex-col justify-end items-center gap-8 p-8">
	<div class="flex flex-col gap-4 w-full">
		{#each messages as message, i (message.id)}
			<div transition:fade class="{message.name === 'A.U.R.O.R.A' ? "self-start" : "self-end"}">
				<ChatBubble
					avatarImg={message.name === 'A.U.R.O.R.A' ? '/images/aurora.jpg' : ''}
					message={message.content}
					name={message.name}
					timestamp={message.timestamp}
					type={message.name === 'A.U.R.O.R.A' ? 'guest' : 'host'}
				/>
				<audio bind:this={speechAudioElements[message.id]} hidden></audio>
			</div>
		{/each}
	</div>
    <form on:submit|preventDefault={sendMessage} class="w-full">
        <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-container-token">
			<input
				bind:value={currentMessage}
				class="bg-transparent border-0 ring-0"
				name="currentMessage"
				placeholder="Write a message..."
				autocomplete="off"
			/>
			{#if messageLoading}
				<button class="variant-filled-surface"><Spinner /></button>
			{:else}
				<button class="variant-filled-primary">Send</button>
			{/if}
        </div>
    </form>
</div>
