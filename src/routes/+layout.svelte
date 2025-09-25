<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import AppShell from "$lib/domain/+shared/ui/layout/AppShell.svelte";
	import NavBar from "$lib/domain/+shared/ui/organisms/NavBar.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#snippet header()}<NavBar />{/snippet}
{#snippet content()}{@render children?.()}{/snippet}

<AppShell {header} {content} />
