import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Relative asset URLs. GitHub Pages serves a project site from
  // https://<user>.github.io/<repo>/, so absolute "/assets/..." paths would
  // resolve against the domain root and 404. './' works under any subpath
  // without hardcoding the repository name.
  base: './',

  build: {
    rollupOptions: {
      // Two entries. Without privacy.html listed here Vite builds only
      // index.html and the policy page — which 152-ФЗ requires to be публично
      // доступной — would simply not exist in dist/.
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
});
