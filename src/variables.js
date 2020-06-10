import seedrandom from 'seedrandom';
import * as THREE from 'three';

export const TD = {
	stargrid: {
		size: 100,
		radius: 2
	},
	scale: 10000,
	camera: {
		object: undefined,
		near: 0.00001,
		fade: 125,
		far: 150,
		position: {
			x: -1,
			y: -1,
			z: -1
		}
	},
	clock: undefined,
	colorHelper: new THREE.Color(),
	colorHelper2: new THREE.Color(),
	scene: undefined,
	renderer: undefined,
	raycaster: undefined,
	texture: {
		manager: undefined,
		list: [],
		star: {
			small: undefined,
			large: undefined,
			surface: undefined
		},
		planet: {
			surface: [],
			ring: undefined
		}
	},
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
		object: undefined,
		sphere: undefined,
		light: undefined,
		pointLight: undefined,
		children: [] // Low quality planets
	},
	planet: { // High quality planet
		this: undefined,
		object: undefined,
		sphere: undefined,
		atmosphere: undefined,
		atmosphere2: undefined,
		children: []
	},
	label: {}
};

export const EVENT = {
	controls: undefined,
	mouse: new THREE.Vector2(),
	mouse2d: new THREE.Vector2()
};

export const MISC = {
	rnd: seedrandom('foo')
};

export const STAR = {
	color: {
		hue:  {
			Purple: 0.9,
			Blue: 0.77,
			Green: 0.5,
			Yellow: 0.2,
			Orange: 0.15,
			Red: 0.05
		},
		brightness: {
			'White': 1,
			'Bright': 0.9,
			'': 0.7,
			'Dark': 0.3
		}
	},
	temperature: {
		Red: { min: 500, max: 3700 },
		Orange: { min: 3700, max: 5200 },
		Yellow: { min: 5200, max: 6000 },
		White: { min: 6000, max: 7500 },
		Green: { min: 7500, max: 10000 },
		Blue: { min: 10000, max: 30000 },
		Purple: { min: 30000, max: 40000 },
	}
};

export const PLANET = {
	surfaceMax: 16
};

export const ASYNC = {
	render: undefined
};

export const NAME_LETTERS = {
	vowels: [
		'a', 'a', 'a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'y',
		'au', 'ay', 'ea', 'ee', 'ei', 'eu', 'ey', 'ie', 'iu', 'oa', 'oe', 'oi', 'oo', 'ou', 'ua', 'ue', 'ui', 'uy'
	],
	cons: [
		'd', 'd', 'd', 'd', 'f', 'g', 'g', 'g', 'k', 'k', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'm', 'm',
		'n', 'n', 'n', 'n', 'p', 'p', 'p', 'p', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 't', 't', 't', 't',
		'sh', 'st'
	],
	consSM: [
		'b', 'b', 'c', 'h', 'h', 'h', 'j', 'j', 'v', 'v', 'w', 'w', 'x', 'z',
		'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr',
		'qu', 'sl', 'sn', 'sm', 'str', 'tr', 'vl', 'vr', 'wr'
	],
	consM: [
		'bb', 'dd', 'ff', 'gg', 'kk', 'll', 'lp', 'lv', 'mm', 'nn', 'np', 'pp', 'rr', 'ss', 'tt'
	],
	consME: [
		'ch', 'ck', 'gh', 'lf', 'lk', 'ls', 'mb', 'mp', 'ng', 'nk', 'rc', 'rd', 'rg', 'rk', 'rp', 'rs', 'rst', 'rt', 'rth', 'tch', 'th'
	]
};
