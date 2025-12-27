#!/usr/bin/env bun
import path from 'path';

const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const binary = Bun.file('./server');
if (await binary.exists()) {
    await binary.delete();
}

console.log('🚀 Build process started');

const result = await Bun.build({
    entrypoints: ['src/index.ts'],
    compile: { outfile: 'server' },
    target: 'bun',
    minify: true,
});

const outputTable = result.outputs.map((output) => ({
    File: path.relative(process.cwd(), output.path),
    Size: formatFileSize(output.size),
    Type: output.kind,
}));

console.table(outputTable);
console.log(`✅ Build process completed`);
