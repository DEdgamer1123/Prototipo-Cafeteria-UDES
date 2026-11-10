import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx,js,jsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.{ts,js}', 'src/auth/**/*.{ts,js}'],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
