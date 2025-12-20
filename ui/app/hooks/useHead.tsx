interface Props {
    title: string;
    description: string;
    url: string;
}

export function useHead({ title, description, url }: Props) {
    return (
        <>
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            <meta property='og:url' content={url} />
            <link rel='canonical' href={url} />
        </>
    );
}
