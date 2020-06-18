export function getColorMix(r1, g1, b1, r2, g2, b2, a) {
	const a1 = 1.0 - a;
	const color = {
		r: r1 * a1 + r2 * a,
		g: g1 * a1 + g2 * a,
		b: b1 * a1 + b2 * a
	};
	return [ color.r, color.g, color.b ];
}
