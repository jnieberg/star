export default class Word {
  constructor(seed, { syllablesMin = 2, syllablesMax = 5, numberSuffixLength = 0 } = {}) {
    this.seed = seed;
    this._NAME_LETTERS = {
      con: [
        'c',
        'd', 'd', 'd', 'd', 'd',
        'f', 'f',
        'g', 'g', 'g',
        'k', 'k', 'k',
        'l', 'l', 'l', 'l', 'l',
        'm', 'm', 'm', 'm', 'm',
        'n', 'n', 'n', 'n', 'n', 'n',
        'p', 'p', 'p', 'p', 'p',
        'r', 'r', 'r', 'r', 'r', 'r',
        's', 's', 's', 's', 's', 's',
        't', 't', 't', 't', 't',
        'x',
        'ch', 'sh', 'sp', 'st', 'th',
      ],
      conS: [
        'b', 'b', 'b', 'b',
        'h', 'h', 'h', 'h',
        'j', 'j', 'j',
        'v', 'v', 'v',
        'w', 'w', 'w',
        'z',
        'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'kw', 'pl', 'pr',
        'qu', 'sc', 'sk', 'sl', 'sn', 'sm', 'spr', 'str', 'sw', 'thr', 'tr', 'tw', 'vl', 'vr', 'wr', 'zw',
      ],
      conE: [
        'ck', 'ct', 'gh', 'gt', 'lf', 'll', 'lk', 'ls', 'lt', 'mb', 'mp', 'mt', 'nd', 'nc', 'ng', 'nk', 'nt',
        'rc', 'rch', 'rd', 'rf', 'rg', 'rk', 'rm', 'rn', 'rp', 'rs', 'rsh', 'rst', 'rt', 'rth', 'ss', 'tch',
      ],
      vow: [
        'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
        'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
        'i', 'i', 'i', 'i', 'i',
        'o', 'o', 'o', 'o', 'o', 'o',
        'u', 'u', 'u', 'u',
        'y',
        'au', 'ea', 'ee', 'ei', 'eu', 'ie', 'oa', 'oe', 'oi', 'oo', 'ou', 'ue', 'ui', // REMOVE?
      ],
      vowE: [
        'ay', 'ey', 'uy',
      ],
    };
    const conS = [...this._NAME_LETTERS.con, ...this._NAME_LETTERS.conS];
    const conM = this._NAME_LETTERS.con;
    const conE = [...this._NAME_LETTERS.con, ...this._NAME_LETTERS.conE];
    // const vowS = this._NAME_LETTERS.vow;
    const vowM = this._NAME_LETTERS.vow;
    // const vowE = [...this._NAME_LETTERS.vow, ...this._NAME_LETTERS.vowE];
    const syllableLength = this.seed.rndInt(syllablesMin, syllablesMax);
    const syllables = [];
    // const wordIndex = 0;
    // const consAtStart = this.seed.rndInt(3) > 0;
    // const consAtEnd = !consAtStart || this.seed.rndInt(3) > 0;
    let wordStart = true;
    let wordEnd = true;
    let wordLength = 0;
    for (let s = 0; s < syllableLength; s += 1) {
      wordLength += 1;
      wordStart = wordEnd;
      wordEnd = this.seed.rndInt(3) === 0 || wordLength >= 3 || s === syllableLength - 1;
      const vowAtStart = this.seed.rndInt(3) === 0;
      const vowAtEnd = this.seed.rndInt(2) === 0 && !vowAtStart;
      let letterStart = vowAtStart && '';
      letterStart = letterStart || (wordStart && this.getRandomLetter(conS));
      letterStart = letterStart || this.getRandomLetter(conM);
      const letterMid = this.getRandomLetter(vowM);
      let letterEnd = vowAtEnd && '';
      letterEnd = letterEnd || (wordEnd && this.getRandomLetter(conE));
      letterEnd = letterEnd || this.getRandomLetter(conM);
      syllables.push(letterStart + letterMid + letterEnd);
      if (wordEnd) {
        wordLength = 0;
        if (this.seed.rndInt(3) === 0 && s < syllableLength - 1) {
          syllables.push('-');
        } else {
          syllables.push(' ');
        }
      }
    }
    // Add number suffix
    if (this.seed.rndInt(5) === 0 && numberSuffixLength > 0) {
      syllables.push(' ');
      syllables.push(this.seed.rndInt(1, numberSuffixLength));
    }
    // console.log(syllables);
    return {
      toString: () => syllables.join('').split(' ').map((word) => `${word}`.replace(/^./, (a) => a.toUpperCase())).filter((a) => a)
        .join(' '),
      list: syllables,
    };
  }

  getRandomLetter(letters) {
    return letters[this.seed.rndInt(letters.length)];
  }
}
