/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Displayed dates depend on the time zone.
    // The expected values in the tests were read in New York time.
    env: { TZ: 'America/New_York' },
  },
});
