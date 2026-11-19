#!/usr/bin/env node
// Comprobaciones antes de publicar. Trabaja sobre `dist/`: mira lo que de verdad se va a servir.
//   pnpm check:release            vista previa: tolera lo pendiente del dueño y lo lista
//   pnpm check:release --strict   producción: falla si queda algo pendiente
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const estricto = process.argv.includes('--strict');
const TOPE_JS_KB = 30; // gzip, todo el JavaScript de la página
const fallos = [];
const avisos = [];
const leer = (f) => readFileSync(f, 'utf8');
const archivos = (dir) =>
  readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? archivos(join(dir, n)) : [join(dir, n)]));

// 1. Un solo gestor de paquetes, con versión exacta.
for (const f of ['package-lock.json', 'yarn.lock']) if (existsSync(f)) fallos.push(`sobra ${f}: el proyecto usa pnpm`);
if (!/^pnpm@\d+\.\d+\.\d+$/.test(JSON.parse(leer('package.json')).packageManager ?? '')) fallos.push('packageManager sin versión exacta de pnpm');

if (!existsSync('dist/index.html')) {
  console.error('check:release: falta dist/. Ejecuta antes `pnpm build`.');
  process.exit(1);
}
const todos = archivos('dist');
const paginas = { en: leer('dist/index.html'), es: leer('dist/es/index.html') };

// 2. Las dos portadas existen, con su idioma, sus alternativas y su titular.
for (const [idioma, html] of Object.entries(paginas)) {
  for (const h of ['hreflang="en"', 'hreflang="es"', 'hreflang="x-default"', 'rel="canonical"'])
    if (!html.includes(h)) fallos.push(`portada ${idioma}: falta ${h}`);
  if (!/<h1[^>]*>[^<]{20,}/.test(html)) fallos.push(`portada ${idioma}: falta el titular`);
  if (/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) fallos.push(`portada ${idioma}: lleva noindex en el HTML`);
}

// 3. La regla noindex solo afecta a la vista previa (pages.dev), nunca al dominio propio.
const reglas = leer('dist/_headers').split(/\n\s*\n/).filter((r) => r.includes('noindex'));
if (reglas.length !== 2 || !reglas.every((r) => /^(#.*\n)?https:\/\/(:version\.)?:project\.pages\.dev\/\*\n/.test(r)))
  fallos.push('_headers: noindex debe estar solo en las dos reglas de pages.dev');

// 4. Presupuesto de JavaScript.
const kb = todos.filter((f) => f.endsWith('.js')).reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0) / 1024;
if (kb > TOPE_JS_KB) fallos.push(`JavaScript: ${kb.toFixed(1)} kB gzip, tope ${TOPE_JS_KB}`);

// 5. Términos reservados (lista privada, fuera del árbol de trabajo): nada de eso llega a un despliegue.
let lista = null;
try {
  lista = join(execFileSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' }).trim(), 'no-publicar.txt');
} catch {
  /* sin git */
}
if (lista && existsSync(lista)) {
  const terminos = leer(lista).split('\n').map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith('#'));
  for (const f of todos.filter((f) => /\.(html|js|css|xml|txt|json|svg)$/.test(f) || f.endsWith('_headers'))) {
    const texto = leer(f).toLowerCase();
    if (terminos.some((t) => texto.includes(t))) fallos.push(`${f}: contiene un término reservado`);
  }
} else avisos.push('sin lista de términos reservados en este clon: no se comprueban');

// 6. Lo que solo el dueño puede cerrar. En vista previa se lista; en producción bloquea.
const pendientes = new Set();
for (const html of Object.values(paginas)) for (const m of html.matchAll(/data-pendiente="([a-z]+)"/g)) pendientes.add(m[1]);
if (Object.values(paginas).some((h) => h.includes('https://example.com'))) pendientes.add('dominio');
const nombres = {
  correo: 'correo de contacto sin confirmar',
  permiso: 'muestras de trabajo sin permiso confirmado',
  imagen: 'muestras de trabajo sin imagen',
  texto: 'texto de un idioma sin revisar por el dueño',
  dominio: 'dominio de producción sin definir (site = example.com)',
};
for (const p of pendientes) (estricto ? fallos : avisos).push(`pendiente del dueño: ${nombres[p] ?? p}`);

for (const a of avisos) console.log(`  aviso · ${a}`);
if (fallos.length) {
  for (const f of fallos) console.error(`  FALLO · ${f}`);
  console.error(`check:release${estricto ? ' --strict' : ''}: ${fallos.length} fallo(s)`);
  process.exit(1);
}
console.log(`check:release${estricto ? ' --strict' : ''} OK · JavaScript ${kb.toFixed(1)} kB gzip`);
