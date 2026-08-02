import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@nexahire/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
});
