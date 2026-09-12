import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Layers, Sliders, Palette, Music, Copy, Check, Sparkles, Waves } from 'lucide-react';
import LiquidSeekBar, { LiquidSeekBarRef, WaveLayerConfig, getDefaultLayers } from './components/common/LiquidSeekBar';
import LiquidAudioWave from './components/common/LiquidAudioWave';

export default function App() {
  const [value, setValue] = useState(0.40);
  const [buffered, setBuffered] = useState(0.75);
  const [isAnimated, setIsAnimated] = useState(true);
  const [color, setColor] = useState('#10b981'); // Emerald green default

  // Wave count and layers for interactive seekbar
  const [waveCount, setWaveCount] = useState<1 | 2 | 3 | 4>(2);
  const [layers, setLayers] = useState<WaveLayerConfig[]>(getDefaultLayers(2));

  // Global modifiers
  const [globalSpeed, setGlobalSpeed] = useState(1.50);
  const [globalAmplitude, setGlobalAmplitude] = useState(1.00);
  const [globalFrequency, setGlobalFrequency] = useState(1.00);
  const [roundness, setRoundness] = useState(1.35); // Exponent for curved organic crests
  const [swellDistance, setSwellDistance] = useState(100); // Progressive wave height build-up distance

  const seekbarRef = useRef<LiquidSeekBarRef>(null);

  // Dynamic colors for the 4 showcase bars
  const [dynamicColors, setDynamicColors] = useState({
    bar1: '#06b6d4', // Cyan
    bar2: '#10b981', // Emerald
    bar3: '#8b5cf6', // Purple
    bar4: '#f43f5e', // Rose
  });

  const handleWaveCountChange = (count: 1 | 2 | 3 | 4) => {
    setWaveCount(count);
    setLayers(getDefaultLayers(count));
  };

  const updateLayer = (index: number, key: keyof WaveLayerConfig, val: number | string) => {
    setLayers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  // Auto-advance progress when playing
  useEffect(() => {
    if (!isAnimated) return;
    const timer = setInterval(() => {
      setValue((prev) => {
        if (prev >= 1) return 0;
        return prev + 0.0012;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isAnimated]);

  // Dynamic color shift cycle for 100% showcase bars
  useEffect(() => {
    if (!isAnimated) return;
    const palette = [
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#3b82f6', // Electric Blue
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#d946ef', // Fuchsia
      '#f43f5e', // Rose
      '#f97316', // Amber Orange
      '#eab308', // Gold
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDynamicColors({
        bar1: palette[step % palette.length],
        bar2: palette[(step + 2) % palette.length],
        bar3: palette[(step + 4) % palette.length],
        bar4: palette[(step + 6) % palette.length],
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [isAnimated]);

  // Code Copy
  const [copied, setCopied] = useState(false);
  const generatedCode = `<LiquidSeekBar
  value={${value.toFixed(2)}}
  buffered={${buffered.toFixed(2)}}
  isAnimated={${isAnimated}}
  color="${color}"
  waveCount={${waveCount}}
  waveSpeed={${globalSpeed}}
  waveAmplitude={${globalAmplitude}}
  waveFrequency={${globalFrequency}}
  roundness={${roundness}}
  swellDistance={${swellDistance}}
  layers={${JSON.stringify(layers, null, 2)}}
  onChange={(val) => setValue(val)}
/>`;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetColors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'White', hex: '#ffffff' },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center pb-16 px-4 sm:px-6 selection:bg-emerald-500/30">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            🌊
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>LiquidSeekBar Studio</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Split Preview
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Live real-time liquid wave on the left, full parameter controls on the right
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAnimated(!isAnimated)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
            isAnimated
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-white/10 hover:bg-white/15 text-slate-200'
          }`}
        >
          {isAnimated ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isAnimated ? 'Pause' : 'Play'}
        </button>
      </header>

      {/* Main Split Screen */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* LEFT COLUMN: Sticky Live Preview & 100% Showcase */}
        <div className="lg:col-span-6 flex flex-col gap-6 lg:sticky lg:top-6">
          
          {/* Card 1: 100% Full-Width Showcase (1-4 Waves with Changing Colors) */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Full-Width Showcase (100% Progress • 1–4 Waves)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Color Shift Active
              </span>
            </div>

            <div className="flex flex-col gap-4 bg-[#050810] border border-white/5 rounded-xl p-4">
              {/* Bar 1: 1 Wave */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    1 Wave Layer (Minimalist Flow)
                  </span>
                  <span className="text-xs">{dynamicColors.bar1}</span>
                </div>
                <LiquidSeekBar
                  value={1.0}
                  buffered={1.0}
                  isAnimated={isAnimated}
                  waveCount={1}
                  color={dynamicColors.bar1}
                  waveSpeed={globalSpeed}
                  waveAmplitude={globalAmplitude}
                  waveFrequency={globalFrequency}
                  roundness={roundness}
                  swellDistance={swellDistance}
                  className="w-full"
                />
              </div>

              {/* Bar 2: 2 Waves (Default) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    2 Wave Layers (Default Calibrated)
                  </span>
                  <span className="text-xs">{dynamicColors.bar2}</span>
                </div>
                <LiquidSeekBar
                  value={1.0}
                  buffered={1.0}
                  isAnimated={isAnimated}
                  waveCount={2}
                  color={dynamicColors.bar2}
                  waveSpeed={globalSpeed}
                  waveAmplitude={globalAmplitude}
                  waveFrequency={globalFrequency}
                  roundness={roundness}
                  swellDistance={swellDistance}
                  className="w-full"
                />
              </div>

              {/* Bar 3: 3 Waves */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    3 Wave Layers (Tri-Parallax Depth)
                  </span>
                  <span className="text-xs">{dynamicColors.bar3}</span>
                </div>
                <LiquidSeekBar
                  value={1.0}
                  buffered={1.0}
                  isAnimated={isAnimated}
                  waveCount={3}
                  color={dynamicColors.bar3}
                  waveSpeed={globalSpeed}
                  waveAmplitude={globalAmplitude}
                  waveFrequency={globalFrequency}
                  roundness={roundness}
                  swellDistance={swellDistance}
                  className="w-full"
                />
              </div>

              {/* Bar 4: 4 Waves */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    4 Wave Layers (Liquid Silk Harmonics)
                  </span>
                  <span className="text-xs">{dynamicColors.bar4}</span>
                </div>
                <LiquidSeekBar
                  value={1.0}
                  buffered={1.0}
                  isAnimated={isAnimated}
                  waveCount={4}
                  color={dynamicColors.bar4}
                  waveSpeed={globalSpeed}
                  waveAmplitude={globalAmplitude}
                  waveFrequency={globalFrequency}
                  roundness={roundness}
                  swellDistance={swellDistance}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              All 4 bars run standard calibrated physics with 100% track coverage and smooth dynamic color shifting.
            </p>
          </div>

          {/* Card 2: Interactive LiquidSeekBar Playback Bar */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                LiquidSeekBar (Interactive Element)
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Progress: {(value * 100).toFixed(1)}%</span>
                <span className="text-slate-600">•</span>
                <span>Buffered: {(buffered * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Interactive Canvas Bar */}
            <div className="w-full bg-[#050810] border border-white/5 rounded-xl px-4 py-8 flex flex-col gap-3">
              <LiquidSeekBar
                ref={seekbarRef}
                value={value}
                buffered={buffered}
                isAnimated={isAnimated}
                color={color}
                waveCount={waveCount}
                layers={layers}
                waveSpeed={globalSpeed}
                waveAmplitude={globalAmplitude}
                waveFrequency={globalFrequency}
                roundness={roundness}
                swellDistance={swellDistance}
                onChange={(val) => setValue(val)}
                onDrag={(val) => setValue(val)}
                className="w-full"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono px-1">
                <span>0% (Rounded Start)</span>
                <span>Mark: {Math.round(value * 100)}% (Taper to 0)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Position Checkpoints */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Position:</span>
                {[0, 0.05, 0.20, 0.40, 0.65, 0.90, 1.0].map((testVal) => (
                  <button
                    key={testVal}
                    onClick={() => {
                      setValue(testVal);
                      seekbarRef.current?.setValue(testVal);
                    }}
                    className={`px-2 py-1 rounded-md border text-[11px] font-mono transition-all ${
                      Math.abs(value - testVal) < 0.02
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {(testVal * 100).toFixed(0)}%
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setValue(0);
                  seekbarRef.current?.setValue(0);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                title="Reset to start"
              >
                <RotateCcw className="w-3 h-3" /> Reset to 0
              </button>
            </div>
          </div>

          {/* Card 3: Standalone LiquidAudioWave */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                Standalone Element: LiquidAudioWave
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                For Audio & Cards
              </span>
            </div>

            <div className="w-full bg-[#050810] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
              <LiquidAudioWave
                isAnimated={isAnimated}
                progress={value}
                waveCount={waveCount}
                layers={layers}
                color={color}
                waveSpeed={globalSpeed}
                waveAmplitude={globalAmplitude}
                waveFrequency={globalFrequency}
                roundness={roundness}
                swellDistance={swellDistance}
                height={38}
                className="w-full"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Standalone wave component for voice notes, podcast players, and album background visuals.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Controls and Customizer */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Section: Wave Layers (1-4) & Phase Offsets */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Wave Count & Layer Offsets
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Choose 1–4 waves and adjust phase offset, speed, and opacity for each layer
                </p>
              </div>

              {/* Wave Count Selector */}
              <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                {([1, 2, 3, 4] as const).map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleWaveCountChange(cnt)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      waveCount === cnt
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Layer Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {layers.map((layer, idx) => (
                <div
                  key={idx}
                  className="bg-[#050810]/70 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="font-bold text-slate-200">
                      Wave #{idx + 1} {idx === layers.length - 1 ? '(Front)' : '(Back)'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {Math.round((layer.opacity ?? 0.8) * 100)}% opacity
                    </span>
                  </div>

                  {/* Offset Phase */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Phase Offset</span>
                      <span className="font-mono text-emerald-400">
                        {((layer.offsetPhase ?? 0) / Math.PI).toFixed(2)}π rad
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.PI * 2}
                      step={0.05}
                      value={layer.offsetPhase ?? 0}
                      onChange={(e) => updateLayer(idx, 'offsetPhase', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Speed */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Flow Speed</span>
                      <span className="font-mono text-emerald-400">{(layer.speed ?? 0.5).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.2"
                      step="0.05"
                      value={layer.speed ?? 0.5}
                      onChange={(e) => updateLayer(idx, 'speed', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Amplitude */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Crest Height</span>
                      <span className="font-mono text-emerald-400">
                        {(layer.amplitudeMultiplier ?? 0.35).toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.6"
                      step="0.02"
                      value={layer.amplitudeMultiplier ?? 0.35}
                      onChange={(e) => updateLayer(idx, 'amplitudeMultiplier', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Opacity</span>
                      <span className="font-mono text-emerald-400">
                        {(layer.opacity ?? 0.8).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={layer.opacity ?? 0.8}
                      onChange={(e) => updateLayer(idx, 'opacity', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Wave Curvature & Global Shape Settings */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Wave Curvature & Organic Shape
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Roundness Exponent */}
              <div className="flex flex-col gap-1.5 bg-[#050810]/70 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Crest Roundness</span>
                  <span className="font-mono text-emerald-400">{roundness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={roundness}
                  onChange={(e) => setRoundness(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <span className="text-[10px] text-slate-400">
                  Eliminates flat plateaus at crest peaks, creating smooth organic roundness
                </span>
              </div>

              {/* Frequency Multiplier */}
              <div className="flex flex-col gap-1.5 bg-[#050810]/70 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Wave Density (Frequency)</span>
                  <span className="font-mono text-emerald-400">{globalFrequency.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.0"
                  step="0.05"
                  value={globalFrequency}
                  onChange={(e) => setGlobalFrequency(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <span className="text-[10px] text-slate-400">
                  Sets the number of crest cycles across track width
                </span>
              </div>

              {/* Global Speed */}
              <div className="flex flex-col gap-1.5 bg-[#050810]/70 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Global Speed</span>
                  <span className="font-mono text-emerald-400">{globalSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={globalSpeed}
                  onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Global Amplitude */}
              <div className="flex flex-col gap-1.5 bg-[#050810]/70 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Global Amplitude</span>
                  <span className="font-mono text-emerald-400">{globalAmplitude.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.8"
                  step="0.05"
                  value={globalAmplitude}
                  onChange={(e) => setGlobalAmplitude(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Swell Distance */}
              <div className="flex flex-col gap-1.5 bg-[#050810]/70 p-3.5 rounded-xl border border-white/10 sm:col-span-2">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Progressive Swell Distance (swellDistance)</span>
                  <span className="font-mono text-emerald-400">{swellDistance} px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="160"
                  step="5"
                  value={swellDistance}
                  onChange={(e) => setSwellDistance(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <span className="text-[10px] text-slate-400">
                  Progressive build-up distance from the left edge (eliminates abrupt jumps at start)
                </span>
              </div>
            </div>
          </div>

          {/* Section: Color Selection */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Palette className="w-4 h-4 text-emerald-400" />
              Color Palette & Customization
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#050810] px-3 py-1.5 rounded-xl border border-white/10">
                <input
                  type="color"
                  value={color.startsWith('#') ? color : '#10b981'}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-transparent font-mono text-xs text-emerald-300 w-24 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {presetColors.map((pc) => (
                  <button
                    key={pc.hex}
                    onClick={() => setColor(pc.hex)}
                    className="w-7 h-7 rounded-lg border border-white/20 transition-transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: pc.hex }}
                    title={pc.name}
                  >
                    {color.toLowerCase() === pc.hex.toLowerCase() && (
                      <Check className={`w-3.5 h-3.5 ${pc.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Export Code */}
          <div className="bg-[#0e1422] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Copy className="w-4 h-4 text-emerald-400" />
                Component JSX Code
              </h2>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy JSX'}
              </button>
            </div>

            <div className="bg-[#050810] rounded-xl p-3.5 border border-white/5 font-mono text-xs text-emerald-200/90 overflow-x-auto">
              <pre>{generatedCode}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
