import { describe, expect, it } from 'vitest';
import * as T from './tiempo';

describe('encuadres', () => {
  it('se viaja hacia el agujero: la distancia decrece en cualquier número de paradas', () => {
    for (const n of [2, 6, 10, 14]) {
      const e = T.encuadres(n, 16 / 9);
      expect(e).toHaveLength(n);
      for (let i = 1; i < n; i++) expect(e[i]!.dist).toBeLessThan(e[i - 1]!.dist);
      expect(e[0]!.dist).toBeCloseTo(60);
      expect(e[n - 1]!.dist).toBeCloseTo(4.6);
    }
  });
  it('en horizontal el agujero empieza a la derecha y llega centrado; en vertical siempre centrado y arriba al empezar', () => {
    const h = T.encuadres(10, 1.6);
    expect(h[0]!.cx).toBeGreaterThan(0.5);
    expect(h[9]!.cx).toBe(0);
    const v = T.encuadres(10, 0.46);
    expect(v.every((p) => p.cx === 0)).toBe(true);
    expect(v[0]!.cy).toBeGreaterThan(0.4);
    expect(v[9]!.cy).toBe(0);
  });
  it('en Inicio el agujero cabe entero en pantalla (horizontal y vertical)', () => {
    // Radio aparente del disco (11 r_s) en unidades de pantalla: 11 / dist / fov.
    for (const aspecto of [16 / 9, 4 / 3, 390 / 844]) {
      const p = T.encuadres(10, aspecto)[0]!;
      const r = 11 / p.dist / p.fov;
      expect(Math.abs(p.cx) + r).toBeLessThan(aspecto);
      expect(Math.abs(p.cy) + r).toBeLessThan(1);
    }
  });
});

describe('scroll', () => {
  it('la última parada se alcanza al final de la página aunque su sección sea corta', () => {
    const nudos = T.nudosDeScroll([0, 900, 1800, 2600], 3000, 900);
    expect(nudos[0]).toBe(0);
    expect(nudos[3]).toBe(2100);
    for (let i = 1; i < nudos.length; i++) expect(nudos[i]!).toBeGreaterThan(nudos[i - 1]!);
    expect(T.posicionDesdeScroll(nudos, 0)).toBe(0);
    expect(T.posicionDesdeScroll(nudos, 2100)).toBe(3);
    expect(T.posicionDesdeScroll(nudos, 450)).toBeCloseTo(0.5);
  });
  it('el scroll solo insinúa la estela: nunca llega a hipervelocidad', () => {
    for (const v of [0, 1, 5, 50, -50]) expect(T.estelaDesdeScroll(v)).toBeLessThanOrEqual(T.TOPE_SCROLL);
    expect(T.estelaDesdeScroll(0.2)).toBe(0);
  });
});

describe('salto', () => {
  it('dura entre 0,9 y 1,4 s y su envolvente sube y baja una sola vez', () => {
    expect(T.duracionSalto(1)).toBe(900);
    expect(T.duracionSalto(9)).toBe(1400);
    let cambios = 0;
    let previo = 0;
    let subiendo = true;
    for (let k = 0; k <= 1.0001; k += 0.01) {
      const e = T.envolventeSalto(k);
      if (subiendo && e < previo) {
        subiendo = false;
        cambios++;
      } else if (!subiendo && e > previo) cambios++;
      previo = e;
    }
    expect(cambios).toBe(1);
    expect(T.envolventeSalto(0)).toBe(0);
    expect(T.envolventeSalto(1)).toBe(0);
  });
  it('el destello no puede cambiar más de 0,09 por segundo (WCAG 2.3.1)', () => {
    let f = 0;
    for (let i = 0; i < 60; i++) f = T.limitarDestello(f, 1, 1 / 60);
    expect(f).toBeCloseTo(0.09, 5);
  });
  it('la luz se apaga rápido y se recupera despacio', () => {
    expect(T.seguirLuz(1, 0, 0.1)).toBeLessThan(0.4);
    expect(T.seguirLuz(0, 1, 0.1)).toBeCloseTo(0.05);
  });
});

describe('ritmo de dibujo', () => {
  it.each([60, 90, 120, 144])('dibuja 60 fotogramas por segundo con un refresco de %i Hz', (hz) => {
    let previo: T.RitmoDibujo | null = null;
    let dibujos = 0;
    for (let i = 0; i < hz; i++) {
      const ahora = i * 1000 / hz;
      const ritmo = T.programarDibujo(ahora, 0, previo);
      if (!ritmo) continue;
      previo = ritmo;
      dibujos++;
    }
    expect(dibujos).toBe(60);
  });

  it('reduce a 10 dibujos por segundo en reposo y recupera el ritmo con el scroll', () => {
    let previo = T.programarDibujo(3000, 0, null);
    expect(previo?.enReposo).toBe(true);
    let dibujos = 0;
    for (let ahora = 3000 + 1000 / 120; ahora < 4000; ahora += 1000 / 120) {
      const ritmo = T.programarDibujo(ahora, 0, previo);
      if (!ritmo) continue;
      previo = ritmo;
      dibujos++;
    }
    expect(dibujos).toBe(9);
    const reanudado = T.programarDibujo(4000, 4000, previo);
    expect(reanudado?.enReposo).toBe(false);
    expect(T.programarDibujo(4000 + 1000 / 60, 4000, reanudado)).not.toBeNull();
  });
});

describe('calidad', () => {
  const correr = (e: T.EstadoGobernador, ms: number, dt: number) => {
    const ordenes: number[] = [];
    for (let t = 0; t < ms; t += dt) {
      const g = T.gobernador(e, dt);
      if (g) ordenes.push(g);
    }
    return ordenes;
  };
  it('a 60 Hz estables no baja de nivel, y un tirón suelto no cuenta', () => {
    const e: T.EstadoGobernador = {};
    expect(T.gobernador(e, 400)).toBe(0); // compilación de shaders al arrancar
    expect(correr(e, 4000, 16.7).filter((g) => g < 0)).toHaveLength(0);
  });
  it('baja si los fotogramas son lentos de forma sostenida', () => {
    expect(correr({}, 3000, 40)).toContain(-1);
  });
  it('sube a prueba; si no aguanta, vuelve atrás y no lo reintenta', () => {
    const e: T.EstadoGobernador = {};
    expect(correr(e, 7000, 16.7)).toEqual([1]);
    expect(correr(e, 1500, 40)).toEqual([-1]); // al subir no aguanta
    expect(correr(e, 20000, 16.7)).toEqual([]);
  });
  it('el scroll normal no apaga la escena; el muy rápido sí', () => {
    expect(T.atenuacionPorScroll(1.5)).toBe(0);
    expect(T.atenuacionPorScroll(-6)).toBe(1);
  });
});

describe('utilidades', () => {
  it('convierte el color de marca a RGB lineal', () => {
    expect(T.hexALineal('#ffffff')).toEqual([1, 1, 1]);
    expect(T.hexALineal(' #000000 ')).toEqual([0, 0, 0]);
    expect(T.hexALineal('ambar')).toBeNull();
  });
  it('el lienzo respeta el tope de píxeles', () => {
    const { w, h } = T.tamanoInterno(1440, 900, 3, 2, 0.95e6);
    expect(w * h).toBeLessThanOrEqual(0.96e6);
  });
});
