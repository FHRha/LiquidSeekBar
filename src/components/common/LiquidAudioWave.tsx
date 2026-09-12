import React, { useRef, useEffect } from 'react';
import { WaveLayerConfig, getDefaultLayers, parseColorToRgb } from './LiquidSeekBar';
import { subscribeWindowVisibility, getIsWindowVisible } from '../../hooks/useWindowVisibility';

export interface LiquidAudioWaveProps {
  isAnimated?: boolean;
  progress?: number; // 0 to 1 (optional: if omitted, draws wave across full width)
  waveCount?: 1 | 2 | 3 | 4;
  layers?: WaveLayerConfig[];
  color?: string; // hex, rgb, or 'r, g, b'
  waveSpeed?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  roundness?: number;
  swellDistance?: number;
  height?: number | string;
  className?: string;
}

export const LiquidAudioWave: React.FC<LiquidAudioWaveProps> = ({
  isAnimated = true,
  progress = 1.0,
  waveCount = 2,
  layers,
  color = '#10b981',
  waveSpeed = 1.5,
  waveAmplitude = 1.0,
  waveFrequency = 1.0,
  roundness = 1.35,
  swellDistance = 100,
  height = 36,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const amplitudeMultiplierRef = useRef(isAnimated ? 1 : 0);

  const isAnimatedRef = useRef(isAnimated);
  isAnimatedRef.current = isAnimated;

  const progressRef = useRef(progress);
  progressRef.current = progress;

  const colorRef = useRef({ r: 16, g: 185, b: 129 });

  useEffect(() => {
    if (color) {
      const parsed = parseColorToRgb(color);
      if (parsed) {
        colorRef.current = parsed;
      }
    }
  }, [color]);

  const activeLayers = layers && layers.length > 0 ? layers : getDefaultLayers(waveCount);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let heightPx = 0;
    let isWindowVisible = getIsWindowVisible();
    let isIntersecting = true;

    const drawWave = (
      time: number,
      offsetPhase: number,
      colorString: string,
      layerSpeed: number,
      baseAmp: number,
      freq: number,
      warpFreq: number,
      warpAmp: number,
      activeWidth: number
    ) => {
      if (activeWidth <= 0) return;

      const baseTop = heightPx * 0.5;
      const baseBottom = heightPx;

      ctx.beginPath();
      ctx.moveTo(activeWidth, baseBottom);
      ctx.lineTo(0, baseBottom);

      const t = time * layerSpeed * waveSpeed;
      const currentAmp = baseAmp * (0.85 + 0.15 * Math.sin(t * 0.5)) * waveAmplitude;
      const effectiveAmp = currentAmp * amplitudeMultiplierRef.current;

      const effectiveSwellDist = Math.min(swellDistance, activeWidth * 0.65);
      const taperExitDist = Math.min(36, activeWidth * 0.35);
      const effectiveFreq = freq * waveFrequency;
      const widthDamp = Math.min(1.0, Math.max(0.35, activeWidth / 80));

      const step = 4;
      const points: { x: number; y: number }[] = [];

      for (let x = 0; x <= activeWidth; x += step) {
        const leftRatio = effectiveSwellDist > 0 ? Math.min(1, Math.max(0, x / effectiveSwellDist)) : 1;
        const leftEnv = leftRatio * leftRatio * (3 - 2 * leftRatio);

        const rightDist = activeWidth - x;
        const rightRatio = taperExitDist > 0 ? Math.min(1, Math.max(0, rightDist / taperExitDist)) : 1;
        const rightEnv = 0.5 * (1 - Math.cos(rightRatio * Math.PI));

        const envelope = leftEnv * rightEnv * widthDamp;
        const edgeDamp = Math.min(1, Math.min(x, rightDist) / 24);
        const warp = Math.sin(x * warpFreq + t) * warpAmp * edgeDamp;

        const phase = x * effectiveFreq + warp + offsetPhase - t;
        const rawSine = Math.sin(phase);
        const roundedSine = (rawSine + 0.18 * Math.sin(2 * phase - Math.PI * 0.5) + 1) / 2.18;
        const waveHeight = Math.pow(Math.max(0, Math.min(1, roundedSine)), roundness ?? 1.35);

        const y = baseTop - (waveHeight * effectiveAmp * envelope);
        points.push({ x, y });
      }

      if (points.length > 0 && points[points.length - 1].x < activeWidth) {
        points.push({ x: activeWidth, y: baseTop });
      }

      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) * 0.5;
        const midY = (p0.y + p1.y) * 0.5;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      if (points.length > 0) {
        const lastP = points[points.length - 1];
        ctx.lineTo(lastP.x, lastP.y);
      }

      ctx.lineTo(activeWidth, baseBottom);
      ctx.closePath();
      ctx.fillStyle = colorString;
      ctx.fill();
    };

    const render = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }

      const activeWidth = width * Math.max(0, Math.min(1, progressRef.current));

      if (!isWindowVisible || !isIntersecting) {
        return;
      }

      if (!isAnimatedRef.current && amplitudeMultiplierRef.current < 0.001) {
        amplitudeMultiplierRef.current = 0;
        ctx.clearRect(0, 0, width, heightPx);
        return;
      }

      ctx.clearRect(0, 0, width, heightPx);

      const targetAmp = isAnimatedRef.current ? 1.0 : 0.0;
      amplitudeMultiplierRef.current += (targetAmp - amplitudeMultiplierRef.current) * 0.08;

      const now = performance.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      timeRef.current += dt;
      const t = timeRef.current;

      const { r, g, b } = colorRef.current;

      activeLayers.forEach((layer) => {
        const layerColor = layer.color || `rgba(${r}, ${g}, ${b}, ${layer.opacity ?? 0.8})`;
        const layerAmp = heightPx * (layer.amplitudeMultiplier ?? 0.35);
        drawWave(
          t,
          layer.offsetPhase ?? 0,
          layerColor,
          layer.speed ?? 0.5,
          layerAmp,
          layer.freq ?? 0.018,
          layer.warpFreq ?? 0.012,
          layer.warpAmp ?? 0.8,
          activeWidth
        );
      });

      if (isAnimatedRef.current || amplitudeMultiplierRef.current > 0.001) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      heightPx = rect.height || 36;

      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(heightPx * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${heightPx}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      render();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry ? entry.isIntersecting : true;
      if (!isIntersecting && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      } else if (isIntersecting && isAnimatedRef.current && isWindowVisible) {
        if (!animationRef.current) render();
      }
    }, { threshold: 0.05 });

    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current);
    }

    const unsubVisibility = subscribeWindowVisibility((visible) => {
      isWindowVisible = visible;
      if (!visible && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      } else if (visible && isAnimatedRef.current && isIntersecting) {
        if (!animationRef.current) render();
      }
    });

    handleResize();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      unsubVisibility();
    };
  }, [activeLayers, waveSpeed, waveAmplitude, waveFrequency, color]);

  useEffect(() => {
    if (isAnimated && !animationRef.current) {
      amplitudeMultiplierRef.current = 0.1;
    }
  }, [isAnimated]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height, minHeight: 20 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default LiquidAudioWave;
