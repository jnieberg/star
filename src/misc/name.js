import { NAME_LETTERS, MISC } from '../variables';

function getRandomLetter(letters) {
	return letters[Math.floor(MISC.rnd() * letters.length)];
}

export default function getName(wordsTotalA = 3, wordTotal = 3, number = 0) {
	const wordsTotal = Math.floor(MISC.rnd() * wordsTotalA) + 1;
	const consS = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM);
	const consM = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM, NAME_LETTERS.consM);
	const consE = NAME_LETTERS.cons.concat(NAME_LETTERS.consME);
	const vowlS = NAME_LETTERS.vowelsSME;
	const vowlM = NAME_LETTERS.vowelsSME;
	const vowlE = NAME_LETTERS.vowelsSME.concat(NAME_LETTERS.vowelsE);
	const wordList = [];
	for (let w = 0; w < wordsTotal; w++) {
		const wordLength = Math.floor(MISC.rnd() * wordTotal) + 1;
		let word = '';
		for (let l = 0; l < wordLength; l++) {
			word = word + (Math.floor(MISC.rnd() * 2) === 0 && l === 0 && wordLength > 2 ? '' : getRandomLetter(l === 0 ? consS : consM));
			word = word + getRandomLetter(l === 0 ? vowlS : l === wordLength - 1 ? vowlE : vowlM, MISC.rnd);
		}
		word = word + (Math.floor(MISC.rnd() * 2) === 0 ? getRandomLetter(consE, MISC.rnd) : '');
		wordList.push(word);
	}
	let text = wordList.join(' ');
	text = text + (Math.floor(MISC.rnd() * 5) === 0 && number > 0 ? ' ' + (Math.floor(MISC.rnd() * number) + 1) : '');
	return text.replace(/(^| )(.)/g, a => a.toUpperCase());
}
