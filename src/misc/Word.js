const NAME_LETTERS = {
	vowels: [
		'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
		'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
		'i', 'i', 'i', 'i', 'i',
		'o', 'o', 'o', 'o', 'o', 'o',
		'u', 'u', 'u', 'u',
		'au', 'ea', 'ee', 'ei', 'eia', 'eu', 'ia', 'ie', 'io', 'iu', 'oa', 'oe', 'oi', 'oo', 'ou', 'ua', 'ue', 'ui'
	],
	vowelsE: [
		'ay', 'ey', 'uy', 'y'
	],
	cons: [
		'c', 'c',
		'd', 'd', 'd', 'd', 'd', 'd',
		'f', 'f',
		'g', 'g', 'g',
		'k', 'k', 'k',
		'l', 'l', 'l', 'l',
		'm', 'm', 'm', 'm', 'm',
		'n', 'n', 'n', 'n', 'n', 'n',
		'p', 'p', 'p', 'p', 'p',
		'r', 'r', 'r', 'r', 'r', 'r',
		's', 's', 's', 's', 's', 's',
		't', 't', 't', 't', 't',
		'x',
		'sh', 'sp', 'st', 'th'
	],
	consSM: [
		'b', 'b', 'b', 'b',
		'h', 'h', 'h', 'h',
		'j', 'j', 'j',
		'v', 'v', 'v',
		'w', 'w', 'w',
		'z',
		'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'kw', 'pl', 'pr',
		'qu', 'sc', 'sk', 'sl', 'sn', 'sm', 'spr', 'str', 'sw', 'thr', 'tr', 'tw', 'vl', 'vr', 'wr', 'zw'
	],
	consM: [
		'bb', 'bbl', 'dd', 'ff', 'gg', 'kk', 'lp', 'lv', 'md', 'mm', 'nn', 'np', 'pp', 'ppl', 'pt', 'rr', 'rv', 'sb', 'sr', 'tt'
	],
	consME: [
		'ch', 'ck', 'ct', 'gh', 'gt', 'lf', 'll', 'lk', 'ls', 'lt', 'mb', 'mp', 'mt', 'nd', 'nc', 'ng', 'nk', 'nt',
		'rc', 'rch', 'rd', 'rf', 'rg', 'rk', 'rm', 'rn', 'rp', 'rs', 'rsh', 'rst', 'rt', 'rth', 'ss', 'tch'
	]
};

export default class Word {
	constructor(seed, { syllablesMin = 2, syllablesMax = 5, numberSuffixLength = 0 } = {}) {
		this.seed = seed;
		const consS = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM);
		const consM = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM, NAME_LETTERS.consM);
		const consE = NAME_LETTERS.cons.concat(NAME_LETTERS.consME);
		const vowlS = NAME_LETTERS.vowels;
		const vowlM = NAME_LETTERS.vowels;
		const vowlE = NAME_LETTERS.vowels.concat(NAME_LETTERS.vowelsE);
		const syllableLength = this.seed.rndInt(syllablesMin, syllablesMax);
		let syllables = [];
		let wordIndex = 0;
		let consAtStart = this.seed.rndInt(3) > 0;
		let consAtEnd = !consAtStart || this.seed.rndInt(3) > 0;
		for (let s = 0; s < syllableLength; s++) {
			const wordEnd = this.seed.rndInt(3) === 0 || s === syllableLength - 1 || wordIndex >= 3;
			const consonant = (consAtStart || wordIndex > 0) ? this.getRandomLetter(wordIndex === 0 ? consS : consM) : '';
			const syllable = this.getRandomLetter((wordIndex === 0) ? vowlS : (wordEnd && !consAtEnd) ? vowlE : vowlM);
			syllables.push(consonant + syllable);
			wordIndex++;
			if (wordEnd) {
				if (consAtEnd) {
					syllables.push(this.getRandomLetter(consE));
				}
				wordIndex = 0;
				consAtStart = this.seed.rndInt(3) > 0;
				consAtEnd = !consAtStart || this.seed.rndInt(3) > 0;
				syllables.push(' ');
			}
		}
		if (this.seed.rndInt(5) === 0 && numberSuffixLength > 0) {
			syllables.push(' ');
			syllables.push(this.seed.rndInt(1, numberSuffixLength));
		}
		syllables = syllables.join('').split(' ').map(word => `${word}`.replace(/^./, a => a.toUpperCase())).filter(a => a);
		return {
			toString: () => syllables.join(' '),
			list: syllables
		};
	}

	getRandomLetter(letters) {
		return letters[this.seed.rndInt(letters.length)];
	}
}
