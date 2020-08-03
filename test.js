export class Random {
	constructor(str) {
		this.seedString = str;
		this.set(str);
	}

	setSeed(str) {
		for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
			h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
			h = h << 13 | h >>> 19;
		}
		return function() {
			h = Math.imul(h ^ h >>> 16, 2246822507);
			h = Math.imul(h ^ h >>> 13, 3266489909);
			return (h = h ^ h >>> 16) >>> 0;
		};
	}

	set(str) {
		this._seedAdd = this.setSeed(str)();
		this._rnd = function() {
			var t = this._seedAdd = this._seedAdd + 0x6D2B79F5;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t = t ^ t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}

	rnd(minA = 1, maxA = 0) {
		const min = minA < maxA ? minA : maxA;
		const max = minA < maxA ? maxA : minA;
		return this._rnd() * (max - min) + min;
	}

	rndInt(minA = 1, maxA = 0) {
		return Math.floor(this.rnd(minA, maxA));
	}
}

const seed = new Random('_foo');

console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
console.log(seed.rndInt(2));
