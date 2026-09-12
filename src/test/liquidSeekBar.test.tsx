import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import LiquidSeekBar, { LiquidSeekBarRef, parseColorToRgb, getDefaultLayers } from '../components/common/LiquidSeekBar';
import LiquidAudioWave from '../components/common/LiquidAudioWave';

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(function() {
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      quadraticCurveTo: vi.fn(),
      roundRect: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      setTransform: vi.fn(),
      scale: vi.fn(),
    };
  });

  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  global.ResizeObserver = MockResizeObserver as any;

  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  global.IntersectionObserver = MockIntersectionObserver as any;
});

describe('LiquidSeekBar & LiquidAudioWave Refined Tests', () => {
  it('correctly parses HEX, RGB, and raw color formats', () => {
    expect(parseColorToRgb('#6366f1')).toEqual({ r: 99, g: 102, b: 241 });
    expect(parseColorToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColorToRgb('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColorToRgb('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColorToRgb('120, 130, 140')).toEqual({ r: 120, g: 130, b: 140 });
  });

  it('provides balanced default layers for 1, 2, 3, and 4 waves', () => {
    expect(getDefaultLayers(1)).toHaveLength(1);
    expect(getDefaultLayers(2)).toHaveLength(2);
    expect(getDefaultLayers(3)).toHaveLength(3);
    expect(getDefaultLayers(4)).toHaveLength(4);

    // Each layer should have a distinct phase offset
    const threeLayers = getDefaultLayers(3);
    expect(threeLayers[0].offsetPhase).not.toEqual(threeLayers[1].offsetPhase);
    expect(threeLayers[1].offsetPhase).not.toEqual(threeLayers[2].offsetPhase);
  });

  it('renders LiquidSeekBar with 1, 2, 3, 4 waves and custom layers without throwing', () => {
    const { container, rerender } = render(
      <LiquidSeekBar value={0.3} waveCount={1} color="#10b981" />
    );
    expect(container.querySelector('canvas')).not.toBeNull();

    rerender(<LiquidSeekBar value={0.5} waveCount={2} color="#f43f5e" />);
    rerender(<LiquidSeekBar value={0.7} waveCount={3} color="#0ea5e9" />);
    rerender(<LiquidSeekBar value={0.9} waveCount={4} color="#f59e0b" />);

    // Custom layers with manual offsetPhase
    rerender(
      <LiquidSeekBar
        value={0.4}
        layers={[
          { offsetPhase: 0, opacity: 0.3, speed: 1.0 },
          { offsetPhase: Math.PI * 0.75, opacity: 0.8, speed: 1.8 },
        ]}
      />
    );
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles boundary values (0, 1, out-of-bounds, NaN, Infinity) cleanly', () => {
    expect(() => {
      const { rerender } = render(<LiquidSeekBar value={0} buffered={0} />);
      rerender(<LiquidSeekBar value={1} buffered={1} />);
      rerender(<LiquidSeekBar value={-0.2} buffered={-0.5} />);
      rerender(<LiquidSeekBar value={1.5} buffered={120} />);
      rerender(<LiquidSeekBar value={NaN} buffered={NaN} />);
      rerender(<LiquidSeekBar value={Infinity} buffered={Infinity} />);
      rerender(<LiquidSeekBar value={-Infinity} buffered={-Infinity} />);
      rerender(<LiquidSeekBar value={0.5} buffered={undefined} />);

      // Rapid re-render simulation during audio playback
      for (let i = 1; i <= 10; i++) {
        rerender(<LiquidSeekBar value={i / 100} isAnimated={true} />);
      }
    }).not.toThrow();
  });

  it('exposes setValue via ref imperative handle', () => {
    const ref = React.createRef<LiquidSeekBarRef>();
    render(<LiquidSeekBar ref={ref} value={0.2} />);
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.setValue).toBe('function');
    expect(() => {
      ref.current?.setValue(0.7);
    }).not.toThrow();
  });

  it('renders standalone LiquidAudioWave correctly', () => {
    const { container, rerender } = render(
      <LiquidAudioWave progress={0.6} waveCount={3} color="#ec4899" height={40} />
    );
    expect(container.querySelector('canvas')).not.toBeNull();

    rerender(<LiquidAudioWave isAnimated={false} progress={1.0} />);
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
