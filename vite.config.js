import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs. GitHub Pages serves a project site from
  // https://<user>.github.io/<repo>/, so absolute "/assets/..." paths would
  // resolve against the domain root and 404. './' works under any subpath
  // without hardcoding the repository name.
  base: './',
});
