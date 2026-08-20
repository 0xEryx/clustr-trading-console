import * as React from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'

const vertex = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU=6.2831853;

float signalField(vec2 p,float t){
  float w=sin(p.x*1.3+t*0.7);
  w+=sin(p.y*1.7-t*0.52)*0.8;
  w+=sin((p.x+p.y)*0.9+t*0.91)*0.6;
  w+=sin((p.x-p.y)*1.53-t*0.63)*0.42;
  return w*0.35;
}

vec3 palette(float f){
  f=clamp(f,0.0,1.0);
  f=pow(f,uContrast);
  vec3 c=mix(uColor1,uColor2,smoothstep(0.08,0.6,f));
  return mix(c,uColor3,smoothstep(0.68,1.0,f));
}

float scanBand(float x,float aa,float sharp){
  float v=mix(0.5,0.5+0.5*cos(x*TAU),aa);
  return pow(v,sharp);
}

void main(){
  float aspect=iResolution.x/iResolution.y;
  vec2 uv0=(gl_FragCoord.xy*2.0-iResolution.xy)/iResolution.y;
  vec2 p=uv0/max(uScale,0.001);
  float t=iTime*uSpeed;
  float mouseBoost=0.0;
  if(uMouseEnabled>0.5){
    vec2 mUv=vec2((uMouse.x*2.0-1.0)*aspect,uMouse.y*2.0-1.0);
    vec2 md=uv0-mUv;
    float r=max(uMouseRadius,0.001);
    mouseBoost=exp(-dot(md,md)/(r*r))*uMouseStrength*uMouseActive;
  }
  float axis;
  if(uDirection<0.5)axis=p.y;
  else if(uDirection<1.5)axis=p.x;
  else axis=(p.x+p.y)*0.70710678;
  float sig=signalField(p*uFrequency,t);
  float coord=axis+sig*uRipple;
  float phase=coord/max(uSweepWidth,0.05)-t*uSweepSpeed;
  float sweep=pow(0.5+0.5*cos(phase*TAU),max(uSweepFalloff,0.1));
  float lc=coord*uBandDensity;
  float aa=1.0/(1.0+uSoftness*fwidth(lc)*3.0);
  aa=clamp(aa*(1.0+mouseBoost*0.6),0.0,1.0);
  float bodyBase=clamp(0.5+0.5*sig,0.0,1.0);
  float body=bodyBase*bodyBase*uGlow*sweep;
  float sharp=max(uLineSharpness,0.1);
  float split=uColorSpread*0.16;
  float fr=clamp(scanBand(lc+split,aa,sharp)*sweep+body,0.0,1.0);
  float fg=clamp(scanBand(lc,aa,sharp)*sweep+body,0.0,1.0);
  float fb=clamp(scanBand(lc-split,aa,sharp)*sweep+body,0.0,1.0);
  vec3 col=vec3(palette(fr).r,palette(fg).g,palette(fb).b);
  float inten=(fr+fg+fb)*0.3333333*uBrightness;
  inten*=1.0+mouseBoost*0.9;
  if(uScanline>0.5)inten*=1.0-0.18*(0.5+0.5*cos(gl_FragCoord.y*1.7));
  if(uGrain>0.5){
    float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+iTime)*43758.5453);
    inten+=(g-0.5)*uGrainIntensity;
  }
  inten*=clamp(1.0-uVignette*smoothstep(0.55,1.65,length(uv0)),0.0,1.0);
  inten=clamp(inten,0.0,1.0);
  float a=clamp(inten*uOpacity,0.0,1.0);
  fragColor=vec4(clamp(col,0.0,1.0)*a,a);
}
`

const contexts = new WeakMap()
const hexToRgb = (hex) => {
  const value = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return value ? [parseInt(value[1], 16) / 255, parseInt(value[2], 16) / 255, parseInt(value[3], 16) / 255] : [1, 1, 1]
}
const directionToFloat = (direction) => direction === 'horizontal' ? 1 : direction === 'diagonal' ? 2 : 0

export function Scanner({
  color1 = '#e0deea', color2 = '#a69fff', color3 = '#ffffff', speed = 0.15,
  sweepSpeed = 0.25, sweepWidth = 1.6, sweepFalloff = 6, scale = 1.5,
  frequency = 2, ripple = 0.7, bandDensity = 11, lineSharpness = 5.5,
  glow = 0.2, scanDirection = 'vertical', colorSpread = 0.69, brightness = 1,
  contrast = 1.2, softness = 1.55, vignette = 0.45, scanline = true,
  grain = true, grainIntensity = 0.05, opacity = 0.4, mouseInteraction = true,
  mouseRadius = 0.5, mouseStrength = 0.5, className = '', portal = false,
}) {
  const containerRef = React.useRef(null)
  const hostRef = React.useRef(null)
  const mouseEnabledRef = React.useRef(mouseInteraction)

  React.useEffect(() => {
    const anchor = containerRef.current
    if (!anchor) return undefined
    const container = portal ? document.createElement('div') : anchor
    if (portal) {
      container.className = `clustr-scanner ${className}`.trim()
      container.setAttribute('aria-hidden', 'true')
      document.body.prepend(container)
    }
    hostRef.current = container
    let renderer
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.6) })
    } catch {
      container.dataset.scannerFallback = 'true'
      return () => { if (portal) container.remove(); hostRef.current = null }
    }

    const gl = renderer.gl
    if (!gl) { container.dataset.scannerFallback = 'true'; return () => { if (portal) container.remove(); hostRef.current = null } }
    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas
    canvas.setAttribute('aria-hidden', 'true')
    Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' })
    container.appendChild(canvas)

    let program
    let mesh
    try {
      program = new Program(gl, { vertex, fragment, uniforms: {
        iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.15 }, uSweepSpeed: { value: 0.25 }, uSweepWidth: { value: 1.6 },
        uSweepFalloff: { value: 6 }, uScale: { value: 1.5 }, uFrequency: { value: 2 },
        uRipple: { value: 0.7 }, uBandDensity: { value: 11 }, uLineSharpness: { value: 5.5 },
        uGlow: { value: 0.2 }, uColorSpread: { value: 0.69 }, uBrightness: { value: 1 },
        uContrast: { value: 1.2 }, uSoftness: { value: 1.55 }, uVignette: { value: 0.45 },
        uOpacity: { value: 0.4 }, uScanline: { value: 1 }, uGrain: { value: 1 },
        uGrainIntensity: { value: 0.05 }, uDirection: { value: 0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) }, uMouseEnabled: { value: 1 },
        uMouseRadius: { value: 0.5 }, uMouseStrength: { value: 0.5 }, uMouseActive: { value: 0 },
        uColor1: { value: new Float32Array([1, 1, 1]) }, uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
      } })
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    } catch {
      container.dataset.scannerFallback = 'true'
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      return () => { if (portal) container.remove(); hostRef.current = null }
    }
    contexts.set(container, { program })

    const render = () => renderer.render({ scene: mesh })
    const setSize = () => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)))
      program.uniforms.iResolution.value[0] = gl.drawingBufferWidth
      program.uniforms.iResolution.value[1] = gl.drawingBufferHeight
      render()
    }
    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    let currentMouse = [0.5, 0.5]
    let targetMouse = [0.5, 0.5]
    let mouseActive = 0
    let targetMouseActive = 0
    const onPointerMove = (event) => {
      targetMouse = [event.clientX / Math.max(1, window.innerWidth), 1 - event.clientY / Math.max(1, window.innerHeight)]
      targetMouseActive = 1
    }
    const onPointerLeave = () => { targetMouseActive = 0 }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    let raf = 0
    let isVisible = true
    let pageVisible = !document.hidden
    let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const start = performance.now()
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0 }
    const loop = (now) => {
      program.uniforms.iTime.value = (now - start) * 0.001
      if (!mouseEnabledRef.current) targetMouseActive = 0
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
      program.uniforms.uMouse.value[0] = currentMouse[0]
      program.uniforms.uMouse.value[1] = currentMouse[1]
      mouseActive += 0.05 * (targetMouseActive - mouseActive)
      program.uniforms.uMouseActive.value = mouseActive
      render()
      raf = requestAnimationFrame(loop)
    }
    const sync = () => {
      if (isVisible && pageVisible && !reduceMotion && !raf) raf = requestAnimationFrame(loop)
      else if (!isVisible || !pageVisible || reduceMotion) { stop(); render() }
    }
    const io = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; sync() }, { threshold: 0 })
    io.observe(container)
    const onVisibility = () => { pageVisible = !document.hidden; sync() }
    const onMotion = (event) => { reduceMotion = event.matches; sync() }
    document.addEventListener('visibilitychange', onVisibility)
    motionQuery.addEventListener?.('change', onMotion)
    sync()

    return () => {
      stop(); ro.disconnect(); io.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener?.('change', onMotion)
      contexts.delete(container)
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      if (portal) container.remove()
      hostRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const ctx = contexts.get(hostRef.current ?? containerRef.current)
    if (!ctx) return
    const u = ctx.program.uniforms
    Object.assign(u.uSpeed, { value: speed }); Object.assign(u.uSweepSpeed, { value: sweepSpeed })
    Object.assign(u.uSweepWidth, { value: sweepWidth }); Object.assign(u.uSweepFalloff, { value: sweepFalloff })
    Object.assign(u.uScale, { value: scale }); Object.assign(u.uFrequency, { value: frequency })
    Object.assign(u.uRipple, { value: ripple }); Object.assign(u.uBandDensity, { value: bandDensity })
    Object.assign(u.uLineSharpness, { value: lineSharpness }); Object.assign(u.uGlow, { value: glow })
    Object.assign(u.uColorSpread, { value: colorSpread }); Object.assign(u.uBrightness, { value: brightness })
    Object.assign(u.uContrast, { value: contrast }); Object.assign(u.uSoftness, { value: softness })
    Object.assign(u.uVignette, { value: vignette }); Object.assign(u.uOpacity, { value: opacity })
    Object.assign(u.uScanline, { value: scanline ? 1 : 0 }); Object.assign(u.uGrain, { value: grain ? 1 : 0 })
    Object.assign(u.uGrainIntensity, { value: grainIntensity }); Object.assign(u.uDirection, { value: directionToFloat(scanDirection) })
    Object.assign(u.uMouseEnabled, { value: mouseInteraction ? 1 : 0 }); Object.assign(u.uMouseRadius, { value: mouseRadius })
    Object.assign(u.uMouseStrength, { value: mouseStrength }); mouseEnabledRef.current = mouseInteraction
    ;[[u.uColor1, color1], [u.uColor2, color2], [u.uColor3, color3]].forEach(([uniform, color]) => {
      const rgb = hexToRgb(color); uniform.value[0] = rgb[0]; uniform.value[1] = rgb[1]; uniform.value[2] = rgb[2]
    })
  }, [color1, color2, color3, speed, sweepSpeed, sweepWidth, sweepFalloff, scale, frequency, ripple, bandDensity, lineSharpness, glow, scanDirection, colorSpread, brightness, contrast, softness, vignette, scanline, grain, grainIntensity, opacity, mouseInteraction, mouseRadius, mouseStrength])

  return portal
    ? React.createElement('span', { ref: containerRef, className: 'clustr-scanner-anchor', 'aria-hidden': true })
    : React.createElement('div', { ref: containerRef, className: `clustr-scanner ${className}`.trim(), 'aria-hidden': true })
}
