<script lang="ts">
	import { formatDateHuman } from '$lib/helpers/date';
	import { Avatar } from '@skeletonlabs/skeleton';

	export let avatarImg: string;
	export let name: string;
	export let message: string;
	export let timestamp: Date;
	export let type: 'host' | 'guest';
</script>

{#if type === 'guest'}
	<div class="grid grid-cols-[auto_1fr] gap-2 min-w-[300px]">
		<Avatar src={avatarImg} initials={"AI"} width="w-12" />
		<div class="card p-4 variant-soft rounded-tl-none space-y-2">
			<header class="flex justify-between items-center gap-2">
				<p class="font-bold">{name}</p>
				<small class="opacity-50">{formatDateHuman(timestamp)}</small>
			</header>
			<p>{message}</p>
		</div>
	</div>
{:else}
	<div class="grid grid-cols-[1fr_auto] gap-2 min-w-[300px]">
		<div class="card p-4 rounded-tr-none space-y-2 !bg-secondary-900">
			<header class="flex justify-between items-center gap-2">
				<p class="font-bold">{name}</p>
				<small class="opacity-50">{formatDateHuman(timestamp)}</small>
			</header>
			<p>{message}</p>
		</div>
		<Avatar src={avatarImg} initials={"SX"} width="w-12" />
	</div>
{/if}
