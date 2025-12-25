#!/usr/bin/env bun
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
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

const outdir = path.join(process.cwd(), 'dist');

if (existsSync(outdir)) {
    await rm(outdir, { recursive: true, force: true });
}

console.log('🚀 Starting build process');

const start = performance.now();
const result = await Bun.build({
    entrypoints: ['src/server.ts'],
    target: 'bun',
    format: 'esm',
    outdir,
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
});
const end = performance.now();

const outputTable = result.outputs.map((output) => ({
    File: path.relative(process.cwd(), output.path),
    Size: formatFileSize(output.size),
    Type: output.kind,
}));

console.table(outputTable);
const buildTime = (end - start).toFixed(2);
console.log(`✅ Build completed in ${buildTime}ms`);
