// Minimal dependency-free line/area chart renderer (SVG string output).
export function renderLineChart(series, { width = 320, height = 140, color = '#1C3F72', fillId = 'lineFill' } = {}) {
  const padX = 8;
  const padY = 16;
  const values = series.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (width - padX * 2) / Math.max(1, series.length - 1);

  const points = series.map((p, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (p.value - min) / range) * (height - padY * 2);
    return [x, y];
  });

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`))
    .join('');

  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${height - padY} L ${points[0][0]} ${height - padY} Z`;

  const dots = points
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === points.length - 1 ? 4 : 3}" fill="${i === points.length - 1 ? color : 'var(--color-surface)'}" stroke="${color}" stroke-width="2"/>`)
    .join('');

  const labels = series
    .map((p, i) => `<text x="${points[i][0]}" y="${height - 2}" font-size="10" fill="var(--color-text-tertiary)" text-anchor="middle" font-weight="600">${p.label}</text>`)
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" style="overflow:visible">
      <defs>
        <linearGradient id="${fillId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#${fillId})" stroke="none"/>
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${labels}
    </svg>
  `;
}
