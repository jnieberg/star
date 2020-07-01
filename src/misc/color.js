import { MISC } from '../variables';

export default function setColor(helperNumber, a1, a2, a3, palette) {
	var helper = helperNumber === 1 ? MISC.colorHelper : helperNumber === 2 ? MISC.colorHelper2 : helperNumber === 3 ? MISC.colorHelper3 : null;
	if (helper) {
		if (palette === 'hsl') {
			helper.setHSL(a1, a2, a3);
		} else {
			helper.setRGB(a1, a2, a3);
		}
		helper.convertSRGBToLinear();
	}
}

export function getColorMix(r1, g1, b1, r2, g2, b2, a) {
	const a1 = 1.0 - a;
	const color = {
		r: r1 * a1 + r2 * a,
		g: g1 * a1 + g2 * a,
		b: b1 * a1 + b2 * a
	};
	return [ color.r, color.g, color.b ];
}
