<script lang="ts">
	import ChatBubble from '$lib/components/ChatBubble/ChatBubble.svelte';
	import Spinner from '$lib/components/Spinner/Spinner.svelte';
	import type { ChatMessage } from '$lib/types/Chat/ChatMessage';
	import axios from 'axios';
	import { fade } from "svelte/transition";

	let messages: ChatMessage[] = [];
	let currentMessage: string;
	let audioEl: HTMLAudioElement;
	let messageLoading = false;

	async function sendMessage() {
		if (messageLoading) {
			return;
		}
		
		messageLoading = true;
		messages.push({
			id: crypto.randomUUID(),
			content: currentMessage,
			name: "Subject X",
			timestamp: new Date(),
		});
		messages = messages;

		currentMessage = "";

		const { data: messageReply } = await axios.post("/api/chat", messages);

		// Audio
		// const response = await fetch('/api/text-to-speech', {
		// 	method: 'POST',
		// 	body: JSON.stringify({ text: messageReply }),
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// });
		// const reader = response.body!.getReader();
		// const chunks = [];
		// while (true) {
		// 	const { done, value } = await reader.read();
		// 	if (done) {
		// 		break;
		// 	}
		// 	chunks.push(value);
		// }
		// const blob = new Blob(chunks, { type: 'audio/mpeg' });
		// const audioUrl = URL.createObjectURL(blob);
		// audioEl.src = audioUrl;
		// audioEl.play();

		messages.push({
			id: crypto.randomUUID(),
			content: messageReply,
			name: "A.U.R.O.R.A",
			timestamp: new Date(),
		});
		messages = messages;
		messageLoading = false;
    }
</script>

<div class="container overflow-auto h-full mx-auto flex flex-col justify-end items-center gap-8 p-8">
	<div class="flex flex-col gap-4 w-full">
		{#each messages as message (message.id)}
			<div transition:fade class="{message.name === 'A.U.R.O.R.A' ? "self-start" : "self-end"}">
				<ChatBubble
					avatarImg={message.name === 'A.U.R.O.R.A' ? '/images/aurora.jpg' : ''}
					message={message.content}
					name={message.name}
					timestamp={message.timestamp}
					type={message.name === 'A.U.R.O.R.A' ? 'guest' : 'host'}
				/>
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
	<audio bind:this={audioEl} hidden></audio>
</div>
