// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://esviswajith95.github.io',
  integrations: [mdx(), sitemap({ filter: (page) => !/\/(404|connect|resume|about)\/?$/.test(page) })],
  redirects: {
    '/resume': '/',
    '/about': '/',
  },
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    ssr: {
      external: ['@resvg/resvg-js', 'satori'],
    },
  },
});
