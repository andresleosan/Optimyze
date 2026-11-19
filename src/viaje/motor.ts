// Motor de la escena: agujero negro (geodésicas por pasos acotados) + cielo con lente + estrellas de viaje.
// WebGL2 a mano, sin dependencias, sin texturas y sin buffers (gl_VertexID / gl_InstanceID): 2 programas, 2 draw calls.
// Unidades: radio de Schwarzschild r_s = 1. Agujero en el origen, disco en el plano y = 0.
// Procedencia: escrito para este proyecto a partir de física conocida (desviación de la luz en la métrica de
// Schwarzschild, perfil de disco fino, efecto Doppler relativista). No se copió código de sitios de ejemplos.

const VS_PANTALLA = `#version 300 es
void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position = vec4(p*2.0-1.0, 0.0, 1.0); }`;

const COMUN = `
uint pcg(uint v){ uint s = v*747796405u+2891336453u; uint w = ((s>>((s>>28u)+4u))^s)*277803737u; return (w>>22u)^w; }
float h1(uint n){ return float(pcg(n)>>8)*(1.0/16777216.0); }
`;

const FS_AGUJERO = `#version 300 es
precision highp float;
uniform vec2 uRes;            // px del buffer
uniform float uTime;          // s
uniform float uDist;          // distancia camara-agujero (r_s)
uniform vec2 uCenter;         // posicion del agujero en pantalla (uv con y en [-1,1])
uniform float uIncl, uRoll;   // elevacion sobre el disco y giro de camara (rad)
uniform float uFov;           // tan(fov/2)
uniform vec3 uAccent;         // color del disco (lineal) = token de marca
uniform float uExposure;
uniform float uFlash;         // halo de salto, ya limitado en JS (WCAG 2.3.1)
uniform float uStepK;         // paso relativo dt = k*r
uniform int uSteps;           // pasos maximos
out vec4 o;
const float R_IN = 3.0, R_OUT = 11.0, R_M = 14.0, TAU = 6.28318530718, BANDAS = 7.0;
${COMUN}
vec3 girar(vec3 v, vec3 eje, float a){ return v*cos(a) + cross(eje,v)*sin(a); }           // eje perpendicular a v
float dFuera(float b, float X){ float s = sqrt(max(0.0, 1.0-b*b/(X*X))); return (1.5/b)*(2.0/3.0 - s + s*s*s/3.0); }

// --- cielo: estrellas fijas por direccion (se evalua con el rayo YA curvado => lente gratis) ---
vec3 capa(vec2 q, float n, int id, float pxRad, float estira){
  vec2 g = q*n; ivec2 c = ivec2(floor(g)); vec2 f = fract(g);
  uint s = pcg(uint(c.x) + uint(c.y)*4099u + uint(id)*65537u);      // UN hash por celda; el resto sale de sus bits
  float m = float(s&255u)*(1.0/255.0); m *= m; m *= m; m *= m;      // pocas brillantes
  vec2 centro = 0.15 + vec2(float((s>>8)&255u), float((s>>16)&255u))*(0.7/255.0);
  float d = length(f-centro)*(2.0/n)*pxRad*estira;                  // distancia en pixeles (aprox.)
  vec3 tinte = mix(vec3(1.0,0.84,0.66), vec3(0.72,0.83,1.0), float(s>>24)*(1.0/255.0));
  return tinte*m*exp(-d*d*1.1);
}
vec3 cielo(vec3 d){
  vec3 a = abs(d); vec2 uv; int cara;
  if(a.x>=a.y && a.x>=a.z){ uv = d.yz/a.x; cara = d.x>0.0?0:1; }
  else if(a.y>=a.z){ uv = d.zx/a.y; cara = d.y>0.0?2:3; }
  else { uv = d.xy/a.z; cara = d.z>0.0?4:5; }
  float pxRad = uRes.y/(2.0*uFov);
  float estira = 1.0/(1.0+dot(uv,uv));
  vec2 q = uv*0.5+0.5;
  vec3 c = capa(q, 30.0, cara, pxRad, estira)*1.6 + capa(q, 84.0, cara+8, pxRad, estira)*0.45;
  float banda = exp(-pow(dot(d, normalize(vec3(0.35,0.9,0.25))), 2.0)*7.0);     // franja tenue tipo via lactea
  return c + vec3(0.0016,0.0019,0.0034)*banda + vec3(0.0003,0.0004,0.0008);
}

// --- disco: anillos con rotacion kepleriana rigida por banda (sin texturas) ---
float anillo(float i, float ang, float omega){
  uint s = pcg(uint(int(i)+4096));
  float K = 5.0 + floor(h1(s)*9.0);
  float a = (ang/TAU + 0.5 - uTime*omega)*K;
  float c = floor(a), f = fract(a); f = f*f*(3.0-2.0*f);
  uint c0 = uint(int(mod(c,K))), c1 = uint(int(mod(c+1.0,K)));
  return mix(h1(s*31u+c0), h1(s*31u+c1), f);
}
vec4 disco(vec3 hit, vec3 v){
  float r = length(hit.xz);
  float x = R_IN/r;
  float flujo = x*x*x*(1.0-sqrt(x))*17.6;                         // perfil radial, pico ~1 en r = 1.36 R_IN
  float ang = atan(hit.z, hit.x);
  float lr = log(r)*BANDAS, i0 = floor(lr), fr = fract(lr); fr = fr*fr*(3.0-2.0*fr);
  float om = 0.5*pow(r,-1.5);
  float n = mix(anillo(i0, ang, om), anillo(i0+1.0, ang, om), fr);
  float lf = lr*3.7, j0 = floor(lf), gr = fract(lf);
  float n2 = mix(anillo(j0+77.0, ang, om), anillo(j0+78.0, ang, om), gr);
  float beta = sqrt(0.5/(r-1.0));                                  // velocidad orbital local
  vec3 tg = vec3(-hit.z, 0.0, hit.x)/r;
  float mu = dot(tg, -normalize(v));
  float g = sqrt(1.0-beta*beta)/(1.0-beta*mu)*sqrt(1.0-1.0/r);     // Doppler x corrimiento gravitatorio
  float realce = mix(1.0, g*g*g, 0.55);
  float borde = smoothstep(R_IN, R_IN*1.15, r)*smoothstep(R_OUT, R_OUT*0.5, r);
  float I = flujo*(0.22+0.78*n)*(0.55+0.45*n2)*realce*borde;
  vec3 c = mix(uAccent*vec3(0.85,0.42,0.3), uAccent, clamp(I*1.6, 0.0, 1.0))*I*2.3 + vec3(1.0,0.82,0.55)*I*I*0.3;
  return vec4(c, clamp(I*1.8, 0.0, 1.0)*borde);
}

void main(){
  vec2 uv = (gl_FragCoord.xy*2.0-uRes)/uRes.y;
  float ce = cos(uIncl), se = sin(uIncl);
  vec3 ro = uDist*vec3(0.0, se, -ce);
  vec3 fw = normalize(-ro), rt = vec3(1.0,0.0,0.0), up = cross(fw, rt);
  vec2 q = (uv-uCenter)*uFov;
  float cr = cos(uRoll), sr = sin(uRoll); q = vec2(cr*q.x-sr*q.y, sr*q.x+cr*q.y);
  vec3 rd = normalize(fw + q.x*rt + q.y*up);

  float tca = -dot(ro, rd);
  float b2 = max(dot(ro,ro)-tca*tca, 1e-6), b = sqrt(b2);
  vec3 eje = normalize(cross(ro, rd));
  vec3 p = ro, v = rd; vec4 acc = vec4(0.0); float brillo = 0.0; float escapa = 1.0;
  bool dentro = uDist < R_M;
  if(b < R_M && (dentro || tca > 0.0)){
    if(!dentro){ p = ro + rd*(tca - sqrt(R_M*R_M-b2)); v = girar(rd, eje, dFuera(b,R_M)-dFuera(b,uDist)); }
    vec3 L = cross(p, v); float h2 = dot(L, L);
    bool fin = false;
    for(int i=0; i<96; i++){
      if(i >= uSteps) break;
      float r2 = dot(p,p);
      if(r2 < 1.0){ escapa = 0.0; fin = true; break; }
      if(r2 > R_M*R_M && dot(p,v) > 0.0){ fin = true; break; }
      float r = sqrt(r2), dt = uStepK*r*(1.0+1.5*smoothstep(4.0, 10.0, r));   // pasos largos donde el campo es debil
      v -= 1.5*h2*p/(r2*r2*r)*dt;
      vec3 pn = p + v*dt;
      if(p.y*pn.y < 0.0){
        vec3 hit = mix(p, pn, p.y/(p.y-pn.y)); float rh = length(hit.xz);
        if(rh > R_IN && rh < R_OUT){ vec4 d = disco(hit, v); acc.rgb += (1.0-acc.a)*d.rgb*d.a; acc.a += (1.0-acc.a)*d.a; }
      }
      if(abs(pn.y) < 1.6){                                           // neblina luminosa barata (sustituye al bloom)
        float rc2 = dot(pn.xz, pn.xz);
        if(rc2 > R_IN*R_IN) brillo += dt*(R_IN*R_IN*R_IN)/(rc2*sqrt(rc2)*(1.0+9.0*pn.y*pn.y));
      }
      p = pn;
    }
    if(!fin && dot(p,p) < 4.8) escapa = 0.0;                        // sin pasos cerca de la esfera de fotones: sombra
    v = normalize(v);
    if(escapa > 0.0){ float bo = length(cross(p, v)); v = girar(v, normalize(cross(p, v)), dFuera(bo, max(length(p), bo))); }
  } else {
    float defl = tca > 0.0 ? 2.0/b + 2.945/b2 - dFuera(b,uDist) : dFuera(b,uDist);
    v = girar(rd, eje, defl);
  }
  vec3 col = acc.rgb;
  if(escapa > 0.0 && acc.a < 0.985) col += (1.0-acc.a)*cielo(v);
  col += uAccent*brillo*0.007;
  col += uAccent*uFlash*exp(-2.6*length(uv-uCenter));
  col = 1.0-exp(-col*uExposure);
  col = pow(col, vec3(1.0/2.2));
  col += (fract(52.9829189*fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))))-0.5)/255.0;   // tramado: evita bandas en negros
  o = vec4(col, 1.0);
}`;

const VS_ESTRELLAS = `#version 300 es
precision highp float;
uniform vec2 uRes, uCenter;
uniform float uFov, uTravel, uStreak, uPx, uGain, uTope;
out vec2 vQ; out float vLen, vW; out vec3 vCol;
const float FONDO = 30.0, ANCHO = 30.0;
${COMUN}
void main(){
  uint id = uint(gl_InstanceID)*8u+17u;
  vec2 xy = (vec2(h1(id), h1(id+1u))*2.0-1.0)*ANCHO;
  float z = FONDO - mod(h1(id+2u)*FONDO + uTravel, FONDO);           // se acerca cuando crece uTravel
  float zt = max(z + uStreak, 0.05);                                 // cola = donde estaba (signo = sentido del viaje)
  vec2 cabeza = xy/(z*uFov) + uCenter, cola = xy/(zt*uFov) + uCenter;
  vec2 d = cabeza-cola; float len = length(d);
  vec2 dir = len > 1e-5 ? d/len : vec2(1.0,0.0), nrm = vec2(-dir.y, dir.x);
  float w = uPx*(1.0+1.4*h1(id+3u))*clamp(4.0/z, 0.7, 2.2);          // semianchura en uv
  vec2 esq = vec2(float(gl_VertexID&1), float(gl_VertexID>>1));
  float a = mix(-w, len+w, esq.x), c = mix(-w, w, esq.y);
  vec2 pos = cola + dir*a + nrm*c;
  vQ = vec2(a, c); vLen = len; vW = w;
  float visible = smoothstep(FONDO, FONDO*0.55, z)*smoothstep(0.2, 1.0, z);
  float reposo = 0.12+0.5*h1(id+6u);                                 // brillo del punto en reposo
  // al alargarse la estela, el brillo POR PIXEL baja hasta un tope (uTope) inferior al umbral de destello de WCAG (0.10):
  // una estela que pasa por un pixel no llega a contar como transicion, por muchas que pasen.
  float brillo = mix(reposo, min(reposo, uTope), smoothstep(0.5, 4.0, len/w));
  vCol = mix(vec3(1.0,0.87,0.72), vec3(0.76,0.86,1.0), h1(id+5u))*visible*brillo*uGain;
  gl_Position = vec4(pos.x*uRes.y/uRes.x, pos.y, 0.0, 1.0);
}`;

const FS_ESTRELLAS = `#version 300 es
precision highp float;
in vec2 vQ; in float vLen, vW; in vec3 vCol; out vec4 o;
void main(){
  float dx = vQ.x - clamp(vQ.x, 0.0, vLen);
  float d = length(vec2(dx, vQ.y))/vW;
  float a = exp(-d*d*3.5);
  float cabeza = mix(0.25, 1.0, clamp(vQ.x/max(vLen, 1e-5), 0.0, 1.0));
  o = vec4(vCol*a*cabeza, 1.0);
}`;

export const NIVELES = {
  baja: { maxDpr: 1, maxPixeles: 0.45e6, pasos: 22, k: 0.3, estrellas: 500 },
  media: { maxDpr: 1.5, maxPixeles: 0.95e6, pasos: 32, k: 0.22, estrellas: 900 },
  alta: { maxDpr: 2, maxPixeles: 2.1e6, pasos: 48, k: 0.16, estrellas: 1500 },
} as const;
export type Nivel = keyof typeof NIVELES;

/** Todo lo que hace falta para dibujar UN fotograma. Mismo estado => mismos píxeles. */
export interface Fotograma {
  time: number;
  dist: number;
  cx: number;
  cy: number;
  incl: number;
  roll: number;
  fov: number;
  exposure: number;
  flash: number;
  travel: number;
  streak: number;
  gain: number;
}

export interface Motor {
  software: boolean;
  perdido: boolean;
  nivel(nombre: Nivel): void;
  tamano(w: number, h: number): void;
  dibujar(s: Fotograma): void;
  alPerder?: () => void;
  alRestaurar?: () => void;
}

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * Crea el motor sobre un lienzo. Devuelve null si no hay WebGL2 o si el dibujo sería por software
 * (demasiado lento): en ese caso la página se queda con el respaldo en CSS.
 */
export function crearMotor(canvas: HTMLCanvasElement, acento: [number, number, number], permitirSoftware = false): Motor | null {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  const software = SOFTWARE.test(renderer);
  if (software && !permitirSoftware) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }

  let agujero: WebGLProgram;
  let estrellas: WebGLProgram;
  let nivel: (typeof NIVELES)[Nivel] = NIVELES.media;
  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);

  function programa(vs: string, fs: string): WebGLProgram {
    const mk = (tipo: number, fuente: string) => {
      const sh = gl!.createShader(tipo)!;
      gl!.shaderSource(sh, fuente);
      gl!.compileShader(sh);
      return sh;
    };
    const p = gl!.createProgram()!;
    const a = mk(gl!.VERTEX_SHADER, vs);
    const b = mk(gl!.FRAGMENT_SHADER, fs);
    gl!.attachShader(p, a);
    gl!.attachShader(p, b);
    gl!.linkProgram(p);
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS))
      throw new Error(`${gl!.getShaderInfoLog(a)}\n${gl!.getShaderInfoLog(b)}\n${gl!.getProgramInfoLog(p)}`);
    return p;
  }
  function montar() {
    agujero = programa(VS_PANTALLA, FS_AGUJERO);
    estrellas = programa(VS_ESTRELLAS, FS_ESTRELLAS);
    gl!.disable(gl!.DEPTH_TEST);
    gl!.blendFunc(gl!.ONE, gl!.ONE);
  }

  const motor: Motor = {
    software,
    perdido: false,
    nivel(nombre) {
      nivel = NIVELES[nombre];
    },
    tamano(w, h) {
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    },
    dibujar(s) {
      if (motor.perdido) return;
      const w = canvas.width;
      const h = canvas.height;
      gl.viewport(0, 0, w, h);
      gl.disable(gl.BLEND);
      gl.useProgram(agujero);
      gl.uniform2f(U(agujero, 'uRes'), w, h);
      gl.uniform1f(U(agujero, 'uTime'), s.time);
      gl.uniform1f(U(agujero, 'uDist'), s.dist);
      gl.uniform2f(U(agujero, 'uCenter'), s.cx, s.cy);
      gl.uniform1f(U(agujero, 'uIncl'), s.incl);
      gl.uniform1f(U(agujero, 'uRoll'), s.roll);
      gl.uniform1f(U(agujero, 'uFov'), s.fov);
      gl.uniform3fv(U(agujero, 'uAccent'), acento);
      gl.uniform1f(U(agujero, 'uExposure'), s.exposure);
      gl.uniform1f(U(agujero, 'uFlash'), s.flash);
      gl.uniform1f(U(agujero, 'uStepK'), nivel.k);
      gl.uniform1i(U(agujero, 'uSteps'), nivel.pasos);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.BLEND);
      gl.useProgram(estrellas);
      gl.uniform2f(U(estrellas, 'uRes'), w, h);
      gl.uniform2f(U(estrellas, 'uCenter'), s.cx, s.cy);
      gl.uniform1f(U(estrellas, 'uFov'), s.fov);
      gl.uniform1f(U(estrellas, 'uTravel'), s.travel);
      gl.uniform1f(U(estrellas, 'uStreak'), s.streak);
      gl.uniform1f(U(estrellas, 'uPx'), 1.1 / h);
      gl.uniform1f(U(estrellas, 'uGain'), s.gain);
      gl.uniform1f(U(estrellas, 'uTope'), 0.7); // brillo máximo de una estela (0..1); son líneas finas, muy lejos de llenar la pantalla
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nivel.estrellas);
    },
  };
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    motor.perdido = true;
    motor.alPerder?.();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    montar();
    motor.perdido = false;
    motor.alRestaurar?.();
  });
  montar();
  return motor;
}
