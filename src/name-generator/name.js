import seedrandom from "seedrandom";
import { NAME_LETTERS } from "../variables";

function getRandomLetter(letters, rnd) {
    return letters[Math.floor(rnd() * letters.length)];
}

export default function getName(id, wordsTotal = 3, wordTotal = 3, number = 0) {
    var rnd = seedrandom(id);
    var wordsTotal = Math.floor(rnd() * wordsTotal) + 1;
    var consS = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM);
    var consM = NAME_LETTERS.cons.concat(NAME_LETTERS.consSM, NAME_LETTERS.consM);
    var consE = NAME_LETTERS.cons.concat(NAME_LETTERS.consME);
    var wordList = [];
    for (var w = 0; w < wordsTotal; w++) {
        var wordLength = Math.floor(rnd() * wordTotal) + 1;
        var word = '';
        for (var l = 0; l < wordLength; l++) {
            word += Math.floor(rnd() * 2) === 0 && l === 0 && wordLength > 2 ? '' : getRandomLetter(l === 0 ? consS : consM, rnd);
            word += getRandomLetter(NAME_LETTERS.vowels, rnd);
        }
        word += Math.floor(rnd() * 2) === 0 ? getRandomLetter(consE, rnd) : '';
        wordList.push(word);
    }
    var text = wordList.join(' ');
    text += Math.floor(rnd() * 5) === 0 && number > 0 ? ' ' + (Math.floor(rnd() * number) + 1) : ''
    return text.replace(/(^| )(.)/g, (a, a1, a2) => a.toUpperCase());
}