import * as THREE from 'three';
import ThingList from './object/ThingList';
import Debug from './misc/debug';

export const TD = {
	stargrid: {
		size: 100,
		radius: 2,
		density: 0.0005
	},
	scale: 10000,
	camera: {
		object: undefined,
		near: 0.0000001,
		fade: 190,
		far: 200,
		orbit: undefined,
		coordinate: {
			x: undefined,
			y: undefined,
			z: undefined
		}
	},
	clock: undefined,
	scene: undefined,
	canvas: undefined,
	renderer: undefined,
	raycaster: undefined,
	texture: {
		manager: undefined,
		star: {
			small: undefined,
			large: undefined,
			surface: undefined
		},
		planet: {
			surface: [],
			rings: undefined
		}
	},
	material: {
		stars: undefined,
		grid: undefined
	},
	stars: {},
	system: undefined,
	star: undefined,
	planet: undefined,
	moon: undefined,
	label: undefined
};

export const EVENT = {
	controls: undefined,
	mouse: new THREE.Vector2(),
	mouse2d: new THREE.Vector2()
};

export const MISC = {
	interrupt: false,
	timers: {},
	timeStart: Date.now(),
	time: 0.0001,
	started: false,
	things: new ThingList(),
	colorHelper: new THREE.Color(),
	colorHelper2: new THREE.Color(),
	colorHelper3: new THREE.Color(),
	reload: false,
	debug: new Debug(),
	interval: 200,
	intervalShadow: 200
};

export const STAR = {
	temperature: {
		Red: { min: 2400, max: 3700 },
		Orange: { min: 3700, max: 5200 },
		Yellow: { min: 5200, max: 6000 },
		White: { min: 6000, max: 7500 },
		Green: { min: 7500, max: 10000 },
		Blue: { min: 10000, max: 30000 },
		Purple: { min: 30000, max: 40000 },
	}
};

export const COLOR = {
	hue:  {
		Purple: 0.9,
		Blue: 0.77,
		Green: 0.5,
		Yellow: 0.2,
		Orange: 0.15,
		Red: 0.05
	},
	saturation: {
		'': 1,
		'Pale': 0.3,
		'Grey': 0.1
	},
	lightness: {
		'White': 1,
		'Bright': 0.95,
		'': 0.7,
		'Dark': 0.3,
		'Black': 0.05
	}
};

export const SHADER = {
	stars: {
		fragment: `varying vec3 vColor;
		varying vec2 vUv;
		uniform sampler2D texture2;
    ${THREE.ShaderChunk.common}
    ${THREE.ShaderChunk.fog_pars_fragment}
    void main() {
      gl_FragColor = vec4( vColor, 1.0 );
      ${THREE.ShaderChunk.fog_fragment}
      #ifdef USE_FOG
        #ifdef USE_LOGDEPTHBUF_EXT
          float depth = 300.0 * gl_FragDepthEXT / gl_FragCoord.w;
        #else
          float depth = 300.0 * gl_FragCoord.z / gl_FragCoord.w;
        #endif
        fogFactor = smoothstep( fogFar, 0.0, depth );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif
			gl_FragColor = gl_FragColor * texture2D( texture2, gl_PointCoord );
		}`
	}
};
