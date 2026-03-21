import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/utils'

// ── Shader sources ───────────────────────────────────────────────────────────
const VERT_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG_SRC = `
precision highp float;
uniform float u_time;
uniform float u_seed;
uniform float u_baseHue;
uniform bool u_isDark;
uniform vec2 u_resolution;

const float GRID_SIZE = 8.0;
const float TWO_PI = 6.28318530718;

float hash(float x, float y, float seed) {
  float n = sin(x * 127.1 + y * 311.7 + seed * 113.3) * 43758.5453;
  return fract(n);
}

vec3 hsl2rgb(float h, float s, float l) {
  h = mod(h, 360.0) / 360.0;
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
  float m = l - c / 2.0;
  vec3 rgb;
  float hue6 = h * 6.0;
  if (hue6 < 1.0) rgb = vec3(c, x, 0.0);
  else if (hue6 < 2.0) rgb = vec3(x, c, 0.0);
  else if (hue6 < 3.0) rgb = vec3(0.0, c, x);
  else if (hue6 < 4.0) rgb = vec3(0.0, x, c);
  else if (hue6 < 5.0) rgb = vec3(x, 0.0, c);
  else rgb = vec3(c, 0.0, x);
  return rgb + m;
}

void main() {
  vec2 fragCoord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  float cellSizePx = u_resolution.x / GRID_SIZE;
  vec2 cellCoord = floor(fragCoord / cellSizePx);
  float x = cellCoord.x;
  float y = cellCoord.y;

  float nx = (x + 0.5) / GRID_SIZE;
  float ny = (y + 0.5) / GRID_SIZE;
  float animTime = u_time * 0.6;
  float cellHash = hash(x, y, u_seed);
  float cellPhase = cellHash * TWO_PI;

  // Moving origin for organic wave
  float originX = 0.5 + sin(u_seed * 0.1 + animTime * 0.3) * 0.15;
  float originY = 0.5 + cos(u_seed * 0.13 + animTime * 0.25) * 0.15;
  float dx = nx - originX;
  float dy = ny - originY;
  float baseDist = sqrt(dx * dx + dy * dy);
  float distWarp = cellHash * 0.12 + sin(cellPhase + animTime * 0.4) * 0.06;
  float dist = baseDist + distWarp;
  float wave = sin(dist * 12.0 - animTime * 6.0) * 0.5 + 0.5;

  // Organic hue flow
  float hueFlow1 = sin(nx * 5.0 + animTime * 1.2 + cellPhase) * 10.0;
  float hueFlow2 = sin(ny * 4.0 - animTime * 0.9 + cellPhase * 1.5) * 8.0;
  float hueFlow3 = sin(dist * 8.0 - animTime * 3.0) * 6.0;
  float waveHueShift = (wave - 0.5) * 70.0;
  float cellHue = u_baseHue + hueFlow1 + hueFlow2 + hueFlow3 + waveHueShift;

  // Twinkle
  float twinkle = 0.0;
  float twinkleHash = hash(x, y, floor(animTime * 3.0 + cellHash * 10.0));
  if (twinkleHash > 0.9) twinkle = 0.15;

  float lightness = 0.2 + wave * 0.5 + twinkle;
  lightness = clamp(lightness, 0.12, 0.88);
  float saturation = 1.0 - wave * 0.4;
  if (!u_isDark) {
    lightness = 0.28 + (lightness - 0.12) * 0.5;
  }

  // Circle mask
  vec2 center = vec2(nx - 0.5, ny - 0.5) * 2.0;
  float circleDist = length(center);
  float mask = 1.0 - smoothstep(0.85, 1.0, circleDist);

  vec3 color = hsl2rgb(cellHue, saturation, lightness);
  gl_FragColor = vec4(color * mask, mask);
}
`

// ── Shared WebGL context ─────────────────────────────────────────────────────
interface Entry {
  target: HTMLCanvasElement
  ctx2d: CanvasRenderingContext2D
  canvasSize: number
  seedNum: number
  baseHue: number
  isDark: boolean
  time: number
  animate: boolean
  lastRenderTs: number
}

interface SharedGL {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  uniforms: {
    time: WebGLUniformLocation
    seed: WebGLUniformLocation
    baseHue: WebGLUniformLocation
    isDark: WebGLUniformLocation
    resolution: WebGLUniformLocation
  }
}

const state = {
  shared: null as SharedGL | null,
  entries: new Map<string, Entry>(),
  rafId: 0,
  lastFrameTs: 0,
  idCounter: 0,
}

function getShared(): SharedGL | null {
  if (state.shared) return state.shared

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, preserveDrawingBuffer: true })
  if (!gl) return null

  const vs = gl.createShader(gl.VERTEX_SHADER)!
  gl.shaderSource(vs, VERT_SRC)
  gl.compileShader(vs)

  const fs = gl.createShader(gl.FRAGMENT_SHADER)!
  gl.shaderSource(fs, FRAG_SRC)
  gl.compileShader(fs)

  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'a_position')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const uniforms = {
    time: gl.getUniformLocation(prog, 'u_time')!,
    seed: gl.getUniformLocation(prog, 'u_seed')!,
    baseHue: gl.getUniformLocation(prog, 'u_baseHue')!,
    isDark: gl.getUniformLocation(prog, 'u_isDark')!,
    resolution: gl.getUniformLocation(prog, 'u_resolution')!,
  }

  state.shared = { canvas, gl, uniforms }
  return state.shared
}

function renderEntry(shared: SharedGL, entry: Entry) {
  const { canvas, gl, uniforms } = shared
  const n = entry.canvasSize

  if (canvas.width !== n || canvas.height !== n) {
    canvas.width = n
    canvas.height = n
  }

  gl.viewport(0, 0, n, n)
  gl.uniform1f(uniforms.time, entry.time)
  gl.uniform1f(uniforms.seed, entry.seedNum)
  gl.uniform1f(uniforms.baseHue, entry.baseHue)
  gl.uniform1i(uniforms.isDark, entry.isDark ? 1 : 0)
  gl.uniform2f(uniforms.resolution, n, n)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  entry.ctx2d.clearRect(0, 0, n, n)
  entry.ctx2d.drawImage(canvas, 0, 0)
}

function tick(timestamp: number) {
  state.rafId = 0
  const shared = getShared()
  if (!shared || state.entries.size === 0) return

  const delta = state.lastFrameTs === 0 ? 0 : timestamp - state.lastFrameTs
  state.lastFrameTs = timestamp
  const dt = delta / 1000

  for (const entry of state.entries.values()) {
    if (entry.animate) entry.time += dt
    renderEntry(shared, entry)
  }

  scheduleFrame()
}

function scheduleFrame() {
  if (state.rafId === 0) {
    for (const entry of state.entries.values()) {
      if (entry.animate) {
        state.rafId = requestAnimationFrame(tick)
        return
      }
    }
  }
}

// ── Component ────────────────────────────────────────────────────────────────
interface PixelLoaderProps {
  size?: number
  animate?: boolean
  seed?: string
  className?: string
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) & 0x7fffffff
  }
  return h % 10000
}

export const PixelLoader: React.FC<PixelLoaderProps> = ({
  size = 20,
  animate = true,
  seed = 'default',
  className,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const entryIdRef = useRef<string | null>(null)

  const seedNum = hashString(seed)
  const baseHue = (137.508 * seedNum) % 360

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasSize = Math.max(64, size * (window.devicePixelRatio || 1))
    canvas.width = canvasSize
    canvas.height = canvasSize

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const id = `pl-${++state.idCounter}`
    const entry: Entry = {
      target: canvas,
      ctx2d,
      canvasSize,
      seedNum,
      baseHue,
      isDark: document.documentElement.classList.contains('dark'),
      time: 0,
      animate,
      lastRenderTs: 0,
    }

    state.entries.set(id, entry)
    entryIdRef.current = id

    const shared = getShared()
    if (shared) renderEntry(shared, entry)
    scheduleFrame()

    return () => {
      state.entries.delete(id)
      if (state.entries.size === 0 && state.rafId !== 0) {
        cancelAnimationFrame(state.rafId)
        state.rafId = 0
        state.lastFrameTs = 0
      }
      entryIdRef.current = null
    }
  }, [size, seedNum])

  // Update animate & dark mode
  useEffect(() => {
    const id = entryIdRef.current
    if (!id) return
    const entry = state.entries.get(id)
    if (!entry) return

    entry.animate = animate
    entry.isDark = document.documentElement.classList.contains('dark')
    entry.seedNum = seedNum
    entry.baseHue = baseHue

    if (!entry.animate) {
      const shared = getShared()
      if (shared) renderEntry(shared, entry)
    }
    scheduleFrame()
  }, [animate, seedNum, baseHue])

  // Observe dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const id = entryIdRef.current
      if (!id) return
      const entry = state.entries.get(id)
      if (!entry) return
      entry.isDark = document.documentElement.classList.contains('dark')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      className={cn('shrink-0 rounded-full overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          borderRadius: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}
