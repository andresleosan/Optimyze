import { inflateSync } from 'node:zlib';

export interface FotogramaRGB {
  ancho: number;
  alto: number;
  canales: number;
  pixeles: Uint8Array;
}

// Adaptado del analizador propio del repaso de la escena. Chromium captura PNG
// RGB o RGBA de 8 bits, sin entrelazado.
export function decodificarCaptura(png: Buffer): FotogramaRGB {
  const ancho = png.readUInt32BE(16);
  const alto = png.readUInt32BE(20);
  const tipo = png[25];
  if (png[24] !== 8 || png[28] !== 0 || (tipo !== 2 && tipo !== 6)) {
    throw new Error('Formato PNG de captura inesperado');
  }
  const canales = tipo === 6 ? 4 : 3;
  const partes: Buffer[] = [];
  for (let o = 8; o < png.length;) {
    const longitud = png.readUInt32BE(o);
    if (png.toString('ascii', o + 4, o + 8) === 'IDAT') {
      partes.push(png.subarray(o + 8, o + 8 + longitud));
    }
    o += longitud + 12;
  }
  const datos = inflateSync(Buffer.concat(partes));
  const fila = ancho * canales;
  const pixeles = new Uint8Array(fila * alto);
  for (let y = 0; y < alto; y++) {
    const inicio = y * (fila + 1);
    const filtro = datos[inicio];
    for (let x = 0; x < fila; x++) {
      const i = y * fila + x;
      const izquierda = x >= canales ? pixeles[i - canales] : 0;
      const arriba = y > 0 ? pixeles[i - fila] : 0;
      const diagonal = y > 0 && x >= canales ? pixeles[i - fila - canales] : 0;
      let valor = datos[inicio + 1 + x];
      switch (filtro) {
        case 1: valor += izquierda; break;
        case 2: valor += arriba; break;
        case 3: valor += (izquierda + arriba) >> 1; break;
        case 4: {
          const base = izquierda + arriba - diagonal;
          const a = Math.abs(base - izquierda);
          const b = Math.abs(base - arriba);
          const c = Math.abs(base - diagonal);
          valor += a <= b && a <= c ? izquierda : b <= c ? arriba : diagonal;
          break;
        }
      }
      pixeles[i] = valor;
    }
  }
  return { ancho, alto, canales, pixeles };
}

const lineal = Float64Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});

const TRANSICIONES = 7;
const SEGUNDO = 1000;

/**
 * Regresión de destellos generales basada en WCAG 2.3.1 y la técnica G19.
 * Cuenta las alternancias de luminancia entre máximos y mínimos locales.
 * Mide la unión conservadora de los píxeles con siete transiciones en el
 * mismo segundo, aunque los destellos de píxeles distintos no vayan en fase.
 * https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
 * https://www.w3.org/WAI/WCAG22/Techniques/general/G19
 */
export function analizadorDestellos(ancho: number, alto: number, escala: number) {
  const cantidad = ancho * alto;
  const maximos = new Float64Array(cantidad);
  const minimos = new Float64Array(cantidad);
  const sentido = new Int8Array(cantidad);
  const cabeza = new Uint8Array(cantidad);
  const tiempos = new Float64Array(cantidad * TRANSICIONES).fill(-Infinity);
  const paso = ancho + 1;
  const acumulados = new Uint32Array(paso * (alto + 1));
  const campoAncho = Math.ceil(341 * escala);
  const campoAlto = Math.ceil(256 * escala);
  const anchoVisible = Math.min(campoAncho, ancho);
  const altoVisible = Math.min(campoAlto, alto);
  let anterior = -Infinity;
  let mayor = 0;

  function medirArea(ahora: number) {
    for (let y = 0; y < alto; y++) {
      let fila = 0;
      for (let x = 0; x < ancho; x++) {
        const i = y * ancho + x;
        if (ahora - tiempos[i * TRANSICIONES + cabeza[i]] < SEGUNDO) fila++;
        const k = (y + 1) * paso + x + 1;
        acumulados[k] = acumulados[k - paso] + fila;
      }
    }
    let maximo = 0;
    for (let y = 0; y + altoVisible <= alto; y++) {
      for (let x = 0; x + anchoVisible <= ancho; x++) {
        const a = y * paso + x;
        const b = (y + altoVisible) * paso + x;
        const area = acumulados[b + anchoVisible] - acumulados[a + anchoVisible] - acumulados[b] + acumulados[a];
        maximo = Math.max(maximo, area);
      }
    }
    mayor = Math.max(mayor, maximo / (campoAncho * campoAlto));
  }

  return {
    anotar(fotograma: FotogramaRGB, ahora: number) {
      if (fotograma.ancho !== ancho || fotograma.alto !== alto || ahora <= anterior) {
        throw new Error('La medida necesita capturas del mismo tamaño y en orden temporal');
      }
      const { pixeles, canales } = fotograma;
      let cambio = false;
      for (let i = 0, j = 0; i < cantidad; i++, j += canales) {
        const luz = 0.2126 * lineal[pixeles[j]] + 0.7152 * lineal[pixeles[j + 1]] + 0.0722 * lineal[pixeles[j + 2]];
        if (anterior === -Infinity) {
          maximos[i] = minimos[i] = luz;
          continue;
        }
        maximos[i] = Math.max(maximos[i], luz);
        minimos[i] = Math.min(minimos[i], luz);
        let direccion = 0;
        if (sentido[i] >= 0 && luz < 0.8 && maximos[i] - luz >= 0.1) direccion = -1;
        if (sentido[i] <= 0 && minimos[i] < 0.8 && luz - minimos[i] >= 0.1) direccion = 1;
        if (!direccion) continue;

        sentido[i] = direccion;
        maximos[i] = minimos[i] = luz;
        const base = i * TRANSICIONES;
        tiempos[base + cabeza[i]] = ahora;
        cabeza[i] = (cabeza[i] + 1) % TRANSICIONES;
        if (ahora - tiempos[base + cabeza[i]] < SEGUNDO) cambio = true;
      }
      if (cambio) medirArea(ahora);
      anterior = ahora;
    },
    get areaMaxima() { return mayor; },
  };
}
