# Optimyze · web

Web pública de Optimyze: una página bilingüe de servicios dentro de un viaje espacial dibujado en WebGL. Este archivo manda sobre las pautas generales de la carpeta superior.

## Reglas de trabajo

- Gestor de paquetes: **pnpm**, con la versión fijada en `package.json`. No uses npm ni yarn.
- Se trabaja y se publica en `main`. Commits cortos, en inglés e imperativo. Nunca `--no-verify`, `reset --hard`, rebase ni force-push.
- **El repositorio es público.** No entran en commits, fichas ni mensajes: nombres o piezas de clientes sin permiso confirmado, correos sin confirmar, documentos internos ni rutas de fuera del repositorio. Las muestras de trabajo se llaman «muestra A» y «muestra B» hasta que haya permiso.
- Cloudflare Pages se maneja solo con `wrangler` y `wrangler.jsonc`. No uses la CLI `cf`.
- No copies código de sitios de ejemplos (shaders incluidos) sin una licencia expresa compatible con uso comercial. Anota de dónde sale cada técnica.
- No inventes datos del negocio (correo, dirección, cifras, testimonios) ni texto comercial nuevo. Lo que falte se marca como pendiente y la compilación de producción falla mientras lo esté.
- El mínimo código que cumple. Sin dependencias nuevas para lo que resuelven pocas líneas.

## Arquitectura en dos capas

1. **Documento.** Todo el contenido es HTML estático en flujo normal, legible y navegable sin JavaScript ni WebGL. Los textos viven en un archivo por idioma. Secciones, pilares, muestras y preguntas son listas, y de ellas salen el menú y las paradas del viaje.
2. **Escena.** Un lienzo fijo detrás, decorativo: sin texto, sin foco y sin eventos de puntero. Lee la lista de paradas y el avance del scroll. Tiene tres estados: animada, fotograma fijo y respaldo en CSS.

La visibilidad del contenido nunca depende del bucle de animación. Nada dibujado en el lienzo tiene que casar con un elemento del documento.

Las variables de diseño están en `src/styles/global.css`.

## Comandos

| Para | Comando |
| --- | --- |
| Instalar | `pnpm install --frozen-lockfile` |
| Desarrollo | `pnpm dev` |
| Tipos | `pnpm check` |
| Pruebas de lógica y contenido | `pnpm test` |
| Compilar | `pnpm build` |
| Comprobaciones de publicación | `pnpm check:release` (con `--strict` para producción: falla si queda algo pendiente del dueño) |
| Recorrido en navegador | `pnpm e2e` (Chrome del sistema, 360 y 1280 px, un solo worker) |
| Ver como en Cloudflare, en local | `pnpm local` |
| Publicar a mano | `pnpm run deploy` |

Antes de cada commit: `pnpm check && pnpm test && pnpm build && pnpm check:release`, y `pnpm e2e` si cambia lo que se ve.

Cada push a `main` llega a GitHub y `.github/workflows/desplegar.yml` comprueba, compila y publica en Cloudflare Pages (https://optimyzejersey.pages.dev). Necesita los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en el repositorio; sin ellos solo avisa y no publica.

## Dónde está cada cosa

- `src/contenido/`: textos por idioma (`es.ts`, `en.ts`) y datos del negocio. Añadir un pilar, una muestra o una pregunta es añadir un elemento a su lista.
- `src/components/Pagina.astro`: la página, igual para los dos idiomas.
- `src/styles/global.css`: variables de diseño y estilos.
- `src/viaje/`: la escena. `tiempo.ts` es lógica pura con pruebas, `motor.ts` dibuja en WebGL y `control.ts` la une al scroll y a los enlaces. Las paradas son los elementos con `data-parada`: el encuadre de cada una se calcula de cuántas hay.
- Ayudas de prueba en la URL: `?software` permite la escena sin GPU y `?estela=0.9` congela un fotograma de hipervelocidad.

## Tareas

Las fichas de construcción están en `docs/roadmap/tasks/WEB-*.json`. El resto de la hoja de ruta es local y no se versiona.
