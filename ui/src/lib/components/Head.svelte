<script lang="ts">
    interface Props {
        title: string;
        description: string;
        url: string;
    }

    let { title, description, url }: Props = $props();
</script>

<svelte:head>
    <link rel="canonical" href={url} />

    <meta property="og:url" content={url} />
    <meta property="og:description" content={description} />
    <meta property="og:title" content={title} />

    <meta name="twitter:description" content={description} />
    <meta name="twitter:title" content={title} />

    <meta name="description" content={description} />
    <title>{title}</title>
</svelte:head>
