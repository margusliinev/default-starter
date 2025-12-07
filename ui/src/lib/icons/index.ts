const svgs = import.meta.glob('./*.svg', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>;

export const icons = Object.fromEntries(
    Object.entries(svgs).map(([path, content]) => [path.replace('./', '').replace('.svg', ''), content]),
);
