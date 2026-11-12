import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://cardinusantara.com',
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});

