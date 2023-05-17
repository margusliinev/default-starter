import { defineConfig } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import commonjs from 'vite-plugin-commonjs';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), macrosPlugin(), commonjs()],
});
