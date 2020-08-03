/* eslint-disable block-scoped-var */
/* eslint-disable no-unused-expressions */
/* eslint-disable vars-on-top */
import { MISC } from '../variables';

export class Random {
	constructor() {
		this.set('_foo');
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
		this.seedString = str;
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

function seed(str) {
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


export default function random(str) {
	var a = seed(str)();
	return function() {
		var t = a = a + 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t = t ^ t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

export function rand(minA = 1, maxA = 0) {
	const min = minA < maxA ? minA : maxA;
	const max = minA < maxA ? maxA : minA;
	return MISC.rnd() * (max - min) + min;
}

export function randInt(minA = 1, maxA = 0) {
	return Math.floor(rand(minA, maxA));
}
