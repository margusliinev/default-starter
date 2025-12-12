<script lang="ts">
    import { icons } from '$lib/icons';

    type IconName = 'github' | 'instagram' | 'linkedin' | 'moon' | 'sun' | 'twitter';
    type IconSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

    interface Props {
        name: IconName;
        size?: IconSize;
        fill?: string;
        stroke?: string;
        strokeWidth?: string;
    }

    const iconSizes = {
        xxs: '12',
        xs: '16',
        sm: '20',
        md: '24',
        lg: '28',
        xl: '32',
        xxl: '36',
    };

    let { name, size = 'md', fill = 'none', stroke = 'currentColor', strokeWidth = '2' }: Props = $props();

    const svg = $derived.by(() => {
        const svgString = icons[name];
        if (!svgString) return '';

        const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/i);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
        const innerContent = svgString.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
        const sizeValue = iconSizes[size];

        return `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="${sizeValue}"
            height="${sizeValue}"
            viewBox="${viewBox}"
            fill="${fill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
            focusable="false">
            ${innerContent}
        </svg>`;
    });
</script>

{@html svg}
