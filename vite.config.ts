import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  // basicSsl serves the dev server over https:// with a self-signed cert so
  // mic/camera APIs (which browsers block on insecure non-localhost origins)
  // work when testing from a phone via the printed Network URL.
  plugins: [react(), basicSsl()],
  server: {
    host: true, // Expose to network
    port: 5173, // Default port
  },
});