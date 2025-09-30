<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";

	let {
		value = $bindable(),
		onValueChange,
		children,
		...restProps
	}: SelectPrimitive.Props = $props();
</script>

<SelectPrimitive.Root bind:value {onValueChange} {...restProps}>
	{@render children?.()}
</SelectPrimitive.Root>

