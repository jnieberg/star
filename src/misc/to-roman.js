export function toRoman(number) {
	let num = number;
	const lookup = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 };
	let roman = '';
	for (const i in lookup) {
		if (lookup[i]) {
			while (num >= lookup[i]) {
				roman = roman + i;
				num = num - lookup[i];
			}
		}
	}
	return roman;
}
