// Minimal dependency-free donut chart (SVG string output).
export function renderDonutChart(slices, { size = 180, thickness = 22 } = {}) {
  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  const r = size / 2;
  const innerR = r - thickness;
  const cx = r;
  const cy = r;
  let angle = -90;

  const paths = slices
    .map((s) => {
      const fraction = s.value / total;
      const sweep = fraction * 360;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return arcPath(cx, cy, r, innerR, start, end, s.color);
    })
    .join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      ${paths}
    </svg>
  `;
}

function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 0) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle, color) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const gap = endAngle - startAngle >= 359.9 ? 0.001 : 0;
  const end = endAngle - gap;

  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, end);
  const p3 = polarToCartesian(cx, cy, rInner, end);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);

  const d = [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');

  return `<path d="${d}" fill="${color}"/>`;
}
