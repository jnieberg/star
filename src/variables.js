import seedrandom from 'seedrandom';
import * as THREE from 'three';

export const TD = {
	scale: 10000,
	camera: {
		object: undefined,
		near: 0.001,
		fade: 100,
		far: 150,
		position: {
			x: -1,
			y: -1,
			z: -1
		}
	},
	clock: undefined,
	colorHelper: new THREE.Color(),
	scene: undefined,
	renderer: undefined,
	raycaster: undefined,
	stars: {
		list: [],
		object: undefined,
		material: undefined,
		geometry: undefined,
		positions: [],
		sizes: [],
		colors: []
	},
	star: {
		this: undefined,
		sphere: undefined,
		flare: undefined,
		light: undefined,
		planets: []
	},
	planet: {
		this: undefined
	},
	label: undefined
};

export const EVENT = {
	controls: undefined,
	mouse: new THREE.Vector2()
};

export const MISC = {
	rnd: seedrandom('foo')
};

export const NAME_LETTERS = {
	vowels: [
		'a', 'a', 'a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'y',
		'au', 'ay', 'ee', 'ei', 'eu', 'ey', 'ie', 'oa', 'oe', 'oi', 'oo', 'ou', 'ua', 'ue', 'uy'
	],
	cons: [
		'd', 'd', 'd', 'd', 'f', 'g', 'g', 'g', 'k', 'k', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'm', 'm',
		'n', 'n', 'n', 'n', 'p', 'p', 'p', 'p', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 't', 't', 't', 't',
		'st'
	],
	consSM: [
		'b', 'b', 'c', 'h', 'h', 'h', 'j', 'j', 'v', 'v', 'w', 'w', 'x', 'z',
		'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr',
		'qu', 'sl', 'sn', 'sm', 'tr', 'vl', 'vr', 'wr'
	],
	consM: [
		'bb', 'dd', 'ff', 'gg', 'kk', 'll', 'lp', 'lv', 'mm', 'nn', 'np', 'pp', 'rr', 'ss', 'tt'
	],
	consME: [
		'ch', 'ck', 'gh', 'lf', 'lk', 'ls', 'mb', 'mp', 'ng', 'nk', 'rg', 'rk', 'rp', 'rs', 'rst', 'rt', 'tch'
	]
};
