import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves project sites from /<repository-name>/.
// In CI GITHUB_REPOSITORY is "owner/repo"; locally we fall back to the known repo name.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Treaties-Map-game';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repo}/` : '/',
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 900,
  },
}));
