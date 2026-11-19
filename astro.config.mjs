// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Dominio de producción: de aquí salen canonical, hreflang y sitemap. Se cambia en este único sitio.
  // Mientras sea example.com, `pnpm check:release --strict` falla y no se puede publicar en producción.
  site: 'https://example.com',
  trailingSlash: 'always',
  // Astro 7 quita por defecto los espacios entre elementos en líneas distintas; true = reglas de HTML.
  compressHTML: true,
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } } })],
});
