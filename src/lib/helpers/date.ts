export function formatDateHuman(date: Date): string {
	const now = new Date();
	const timeDiff = now.getTime() - date.getTime();
	const oneDay = 24 * 60 * 60 * 1000;

	if (timeDiff < oneDay) {
		// Less than a day ago
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'pm' : 'am';
		const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `Today @ ${formattedHours}:${formattedMinutes}${ampm}`;
	} else if (timeDiff < 2 * oneDay) {
		// Yesterday
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'pm' : 'am';
		const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `Yesterday @ ${formattedHours}:${formattedMinutes}${ampm}`;
	} else {
		// More than 1 day ago
		const formattedMonth = date.toLocaleString('default', { month: 'long' });
		const day = date.getDate();
		const year = date.getFullYear();
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'pm' : 'am';
		const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `${formattedMonth} ${day}, ${year} @ ${formattedHours}:${formattedMinutes}${ampm}`;
	}
}
