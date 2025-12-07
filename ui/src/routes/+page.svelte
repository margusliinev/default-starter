<script lang="ts">
    import Head from '$lib/components/Head.svelte';
    import { onMount } from 'svelte';
    import { api } from '$lib';

    let message = $state('');

    onMount(async () => {
        message = await api.get<string>('/health');
    });
</script>

<Head
    title="Default Starter"
    description="Default Starter is a template for new projects built with my preferred stack."
    url="https://github.com/margusliinev/default-starter"
/>

<h1>Default Starter</h1>
<p>{message}</p>
