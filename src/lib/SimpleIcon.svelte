<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	type Props = {
		icon: SimpleIcon;
		size?: number | string;
		color?: string;
		fill?: string;
		strokeWidth?: number | string;
		strokeColor?: string;
		strokeLinecap?: 'butt' | 'round' | 'square';
		strokeLinejoin?: 'miter' | 'round' | 'bevel';
	};
	let {
		icon,
		size = 24,
		color = 'currentColor',
		strokeColor = color,
		strokeWidth = 0.25,
		strokeLinecap = 'round',
		strokeLinejoin = 'round'
	}: Props = $props();
</script>

<svg
	class="lucide"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={color}
	stroke={strokeColor}
	stroke-width={strokeWidth}
	stroke-linecap={strokeLinecap}
	stroke-linejoin={strokeLinejoin}
	xmlns="http://www.w3.org/2000/svg"
>
	<path d={icon.path} />
</svg>
