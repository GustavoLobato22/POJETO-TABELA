// Minimal dependency-free grouped/simple bar chart (SVG string output).
export function renderBarChart(series, { width = 320, height = 160, colorA = '#1C3F72', colorB = '#DC2626', grouped = false } = {}) {
  const padX = 6;
  const padY = 16;
  const gap = 10;
  const n = series.length;
  const groupWidth = (width - padX * 2 - gap * (n - 1)) / n;
  const maxVal = Math.max(1, ...series.flatMap((s) => (grouped ? [s.a, s.b] : [s.value])));

  let bars = '';
  series.forEach((s, i) => {
    const gx = padX + i * (groupWidth + gap);
    if (grouped) {
      const barW = (groupWidth - 4) / 2;
      const ha = (s.a / maxVal) * (height - padY * 2);
      const hb = (s.b / maxVal) * (height - padY * 2);
      bars += `<rect x="${gx}" y="${height - padY - ha}" width="${barW}" height="${Math.max(ha, 1)}" rx="4" fill="${colorA}"/>`;
      bars += `<rect x="${gx + barW + 4}" y="${height - padY - hb}" width="${barW}" height="${Math.max(hb, 1)}" rx="4" fill="${colorB}"/>`;
    } else {
      const h = (s.value / maxVal) * (height - padY * 2);
      bars += `<rect x="${gx}" y="${height - padY - h}" width="${groupWidth}" height="${Math.max(h, 3)}" rx="6" fill="${s.color || colorA}"/>`;
    }
    bars += `<text x="${gx + groupWidth / 2}" y="${height - 2}" font-size="10" fill="var(--color-text-tertiary)" text-anchor="middle" font-weight="600">${s.label}</text>`;
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" style="overflow:visible">${bars}</svg>`;
}
