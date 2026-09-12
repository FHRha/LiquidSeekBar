import math, os, colorsys, subprocess
from PIL import Image, ImageDraw, ImageFont

W, H = 900, 520
TOTAL_FRAMES = 75
FPS = 30
WAVE_SPEED = 1.5
ROUNDNESS = 1.35
SWELL_DIST = 100

ASSETS_DIR = r'E:\Code\LiquidSeekBar\assets'
FRAMES_DIR = os.path.join(ASSETS_DIR, 'frames')
OUT_GIF = os.path.join(ASSETS_DIR, 'liquid-seekbar-showcase.gif')
os.makedirs(FRAMES_DIR, exist_ok=True)

layers_config = {
    1: [
        {'offset': 0, 'opacity': 0.85, 'speed': 0.60, 'amp': 0.40, 'freq': 0.026, 'warpFreq': 0.014, 'warpAmp': 0.8}
    ],
    2: [
        {'offset': 0, 'opacity': 0.35, 'speed': 0.50, 'amp': 0.36, 'freq': 0.022, 'warpFreq': 0.012, 'warpAmp': 1.0},
        {'offset': math.pi * 0.90, 'opacity': 0.80, 'speed': 0.65, 'amp': 0.40, 'freq': 0.028, 'warpFreq': 0.016, 'warpAmp': 0.8}
    ],
    3: [
        {'offset': 0, 'opacity': 0.30, 'speed': 0.45, 'amp': 0.32, 'freq': 0.020, 'warpFreq': 0.010, 'warpAmp': 1.0},
        {'offset': math.pi * 0.55, 'opacity': 0.55, 'speed': 0.58, 'amp': 0.36, 'freq': 0.025, 'warpFreq': 0.013, 'warpAmp': 0.9},
        {'offset': math.pi * 0.95, 'opacity': 0.85, 'speed': 0.68, 'amp': 0.42, 'freq': 0.030, 'warpFreq': 0.016, 'warpAmp': 0.8}
    ],
    4: [
        {'offset': 0, 'opacity': 0.22, 'speed': 0.40, 'amp': 0.28, 'freq': 0.018, 'warpFreq': 0.009, 'warpAmp': 1.0},
        {'offset': math.pi * 0.45, 'opacity': 0.42, 'speed': 0.50, 'amp': 0.32, 'freq': 0.023, 'warpFreq': 0.012, 'warpAmp': 0.9},
        {'offset': math.pi * 0.90, 'opacity': 0.65, 'speed': 0.62, 'amp': 0.38, 'freq': 0.028, 'warpFreq': 0.015, 'warpAmp': 0.8},
        {'offset': math.pi * 1.35, 'opacity': 0.88, 'speed': 0.72, 'amp': 0.42, 'freq': 0.032, 'warpFreq': 0.018, 'warpAmp': 0.7}
    ]
}

bars_info = [
    {'count': 1, 'label': '1 Wave Layer (Minimalist Flow)', 'base_hue': 185 / 360.0},
    {'count': 2, 'label': '2 Wave Layers (Default Calibrated)', 'base_hue': 155 / 360.0},
    {'count': 3, 'label': '3 Wave Layers (Tri-Parallax Depth)', 'base_hue': 270 / 360.0},
    {'count': 4, 'label': '4 Wave Layers (Liquid Silk Harmonics)', 'base_hue': 345 / 360.0}
]

bar_x = 48
bar_w = W - 96
bar_h = 36
start_y = 118
gap = 94

images = []

for frame in range(TOTAL_FRAMES):
    time = (frame / TOTAL_FRAMES) * 2 * math.pi
    hue_shift = (frame / TOTAL_FRAMES)

    base_img = Image.new('RGBA', (W, H), (7, 11, 20, 255))
    draw_base = ImageDraw.Draw(base_img)

    # Card background
    card_margin = 18
    draw_base.rounded_rectangle([card_margin, card_margin, W - card_margin, H - card_margin], radius=16, fill=(13, 19, 34, 255), outline=(255, 255, 255, 25), width=1)

    # Tracks background
    for idx in range(len(bars_info)):
        y = start_y + idx * gap
        draw_base.rounded_rectangle([bar_x, y + bar_h // 2 - 2, bar_x + bar_w, y + bar_h // 2 + 2], radius=2, fill=(255, 255, 255, 40))

    # Composite wave layers
    curr_img = base_img
    for idx, bar in enumerate(bars_info):
        y = start_y + idx * gap
        current_hue = (bar['base_hue'] + hue_shift) % 1.0
        r_f, g_f, b_f = colorsys.hsv_to_rgb(current_hue, 0.85, 0.95)
        rgb = (int(r_f * 255), int(g_f * 255), int(b_f * 255))

        for layer in layers_config[bar['count']]:
            layer_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            layer_draw = ImageDraw.Draw(layer_img)

            t = time * layer['speed'] * WAVE_SPEED
            cur_amp = layer['amp'] * (0.85 + 0.15 * math.sin(t * 0.5))
            effective_swell = min(SWELL_DIST, bar_w * 0.65)
            taper_exit = min(36, bar_w * 0.35)

            points = []
            base_top = y + bar_h // 2 - 2
            base_bottom = y + bar_h // 2 + 2

            step = 3
            for px in range(0, bar_w + 1, step):
                left_ratio = min(1.0, max(0.0, px / effective_swell)) if effective_swell > 0 else 1.0
                left_env = left_ratio * left_ratio * (3.0 - 2.0 * left_ratio)

                right_dist = bar_w - px
                right_ratio = min(1.0, max(0.0, right_dist / taper_exit)) if taper_exit > 0 else 1.0
                right_env = 0.5 * (1.0 - math.cos(right_ratio * math.pi))

                envelope = left_env * right_env
                edge_damp = min(1.0, min(px, right_dist) / 24.0)
                warp = math.sin(px * layer['warpFreq'] + t) * layer['warpAmp'] * edge_damp

                phase = px * layer['freq'] + warp + layer['offset'] - t
                raw_sine = math.sin(phase)
                rounded_sine = (raw_sine + 0.18 * math.sin(2.0 * phase - math.pi * 0.5) + 1.0) / 2.18
                wave_height = math.pow(max(0.0, min(1.0, rounded_sine)), ROUNDNESS)

                py = base_top - (wave_height * cur_amp * bar_h * 0.85 * envelope)
                points.append((bar_x + px, py))

            poly = [(bar_x + 2, base_bottom)] + points + [(bar_x + bar_w, base_bottom)]
            fill_color = (rgb[0], rgb[1], rgb[2], int(layer['opacity'] * 255))
            layer_draw.polygon(poly, fill=fill_color)
            layer_draw.ellipse([bar_x, y + bar_h // 2 - 2, bar_x + 4, y + bar_h // 2 + 2], fill=fill_color)

            curr_img = Image.alpha_composite(curr_img, layer_img)

    # Final Text overlay on top of composited image
    final_draw = ImageDraw.Draw(curr_img)
    final_draw.text((48, 42), 'LiquidSeekBar -- Fluid Multi-Wave Audio Progress Bar', fill=(255, 255, 255, 255))
    final_draw.text((48, 66), '100% Track Showcase | Standard Settings with Dynamic Color Harmony', fill=(100, 116, 139, 255))

    for idx, bar in enumerate(bars_info):
        y = start_y + idx * gap
        current_hue = (bar['base_hue'] + hue_shift) % 1.0
        r_f, g_f, b_f = colorsys.hsv_to_rgb(current_hue, 0.85, 0.95)
        rgb = (int(r_f * 255), int(g_f * 255), int(b_f * 255))
        hex_code = '#{:02X}{:02X}{:02X}'.format(*rgb)

        final_draw.text((bar_x, y - 20), bar['label'], fill=(148, 163, 184, 255))
        final_draw.text((bar_x + bar_w - 70, y - 20), hex_code, fill=(rgb[0], rgb[1], rgb[2], 255))

    frame_path = os.path.join(FRAMES_DIR, f'frame_{frame:04d}.png')
    curr_img.save(frame_path)
    images.append(curr_img.convert('RGB'))

print(f'{TOTAL_FRAMES} frames generated. Compiling GIF with ffmpeg...')

try:
    input_pat = os.path.join(FRAMES_DIR, 'frame_%04d.png')
    cmd = [
        'ffmpeg', '-y', '-framerate', str(FPS), '-i', input_pat,
        '-filter_complex', '[0:v] split [a][b];[a] palettegen=max_colors=128:reserve_transparent=0 [p];[b][p] paletteuse=dither=bayer:bayer_scale=3',
        '-loop', '0', OUT_GIF
    ]
    subprocess.run(cmd, check=True)
    print('SUCCESS! High quality GIF created at:', OUT_GIF)
except Exception as e:
    print('ffmpeg error:', e)
    images[0].save(OUT_GIF, save_all=True, append_images=images[1:], duration=33, loop=0)
