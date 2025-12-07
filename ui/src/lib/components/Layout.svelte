<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="layout">
    {@render children?.()}
</div>

<style>
    .layout {
        max-width: 1536px;
        margin: 0 auto;
    }
</style>
