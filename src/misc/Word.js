import { MISC } from '../variables';

const NAME_LETTERS = {
	vowels: [
		'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
		'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
		'i', 'i', 'i', 'i', 'i',
		'o', 'o', 'o', 'o', 'o', 'o',
		'u', 'u', 'u', 'u',
		'au', 'ea', 'ee', 'ei', 'eu', 'ia', 'ie', 'io', 'iu', 'oa', 'oe', 'oi', 'oo', 'ou', 'ua', 'ue', 'ui'
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
		'sh', 'st', 'th'
	],
	consSM: [
		'b', 'b', 'b', 'b',
		'h', 'h', 'h', 'h',
		'j', 'j', 'j',
		'v', 'v', 'v',
		'w', 'w', 'w',
		'z',
		'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr',
		'qu', 'sl', 'sn', 'sm', 'spr', 'str', 'thr', 'tr', 'vl', 'vr', 'wr'
	],
	consM: [
		'bb', 'dd', 'ff', 'gg', 'kk', 'lp', 'lv', 'md', 'mm', 'nn', 'np', 'pp', 'pt', 'rr', 'rv', 'tt'
	],
	consME: [
		'ch', 'ck', 'ct', 'gh', 'gt', 'lf', 'll', 'lk', 'ls', 'lt', 'mb', 'mp', 'mt', 'nd', 'nc', 'ng', 'nk', 'nt',
		'rc', 'rch', 'rd', 'rf', 'rg', 'rk', 'rm', 'rn', 'rp', 'rs', 'rsh', 'rst', 'rt', 'rth', 'ss', 'tch'
	]
};

function getRandomLetter(letters) {
	return letters[Math.floor(MISC.rnd() * letters.length)];
}

export default class Word {
	constructor({ words = 2, syllables = 2, numberSuffixLength = 0 } = {}) {
		const wordsTotal = Math.floor(MISC.rnd() * words) + 1;
		const consS = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM);
		const consM = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM, NAME_LETTERS.consM);
		const consE = NAME_LETTERS.cons.concat(NAME_LETTERS.consME);
		const vowlS = NAME_LETTERS.vowels;
		const vowlM = NAME_LETTERS.vowels;
		const vowlE = NAME_LETTERS.vowels.concat(NAME_LETTERS.vowelsE);
		let wordList = [];
		for (let w = 0; w < wordsTotal; w++) {
			const consAtEnd = Math.floor(MISC.rnd() * 2) === 0;
			const wordLength = Math.floor(MISC.rnd() * syllables) + 1;
			let word = '';
			for (let l = 0; l < wordLength; l++) {
				word = word + (Math.floor(MISC.rnd() * 2) === 0 && l === 0 && wordLength > 2 ? '' : getRandomLetter(l === 0 ? consS : consM));
				word = word + getRandomLetter(l === 0 ? vowlS : l === wordLength - 1 && !consAtEnd ? vowlE : vowlM, MISC.rnd);
			}
			word = word + (consAtEnd ? getRandomLetter(consE, MISC.rnd) : '');
			wordList.push(word);
		}
		if (Math.floor(MISC.rnd() * 5) === 0 && numberSuffixLength > 0) {
			wordList.push(Math.floor(MISC.rnd() * numberSuffixLength) + 1);
		}
		wordList = wordList.map(word => `${word}`.replace(/^./, a => a.toUpperCase()));
		return {
			toString: () => wordList.join(' '),
			list: wordList
		};
	}
}
