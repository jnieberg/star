import seedrandom from 'seedrandom';
import * as THREE from 'three';

export const TD = {
	stargrid: {
		size: 100,
		radius: 6,
		density: 0.0005
	},
	scale: 10000,
	camera: {
		object: undefined,
		near: 0.000001,
		fade: 500,
		far: 600,
		coordinate: {
			x: undefined,
			y: undefined,
			z: undefined
		}
	},
	clock: undefined,
	scene: undefined,
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
			ring: undefined
		}
	},
	material: {
		stars: undefined,
		grid: undefined
	},
	stars: {},
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
		sphereOut: undefined,
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
	rnd: seedrandom('foo'),
	colorHelper: new THREE.Color(),
	colorHelper2: new THREE.Color(),
	colorHelper3: new THREE.Color(),
	reload: false,
	planet: {
		surfaceMax: 18
	},
	loading: false
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

export const NAME_LETTERS = {
	vowelsSME: [
		'a', 'a', 'a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'u', 'u', 'u',
		'au', 'ea', 'ee', 'ei', 'eu', 'ie', 'iu', 'oa', 'oe', 'oi', 'oo', 'ou', 'ua', 'ue', 'ui'
	],
	vowelsE: [
		'ay', 'ey', 'uy', 'y'
	],
	cons: [
		'c', 'd', 'd', 'd', 'd', 'f', 'g', 'g', 'g', 'k', 'k', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'm', 'm',
		'n', 'n', 'n', 'n', 'p', 'p', 'p', 'p', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 't', 't', 't', 't',
		'sh', 'st', 'th'
	],
	consSM: [
		'b', 'b', 'b', 'b', 'h', 'h', 'h', 'h', 'j', 'j', 'j', 'v', 'v', 'w', 'w', 'w', 'x', 'z',
		'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr',
		'qu', 'sl', 'sn', 'sm', 'str', 'tr', 'vl', 'vr', 'wr'
	],
	consM: [
		'bb', 'dd', 'ff', 'gg', 'kk', 'll', 'lp', 'lv', 'mm', 'nn', 'np', 'pp', 'pt', 'rr', 'ss', 'tt'
	],
	consME: [
		'ch', 'ck', 'gh', 'lf', 'lk', 'ls', 'mb', 'mp', 'nc', 'ng', 'nk', 'rc', 'rch', 'rd', 'rg', 'rk', 'rm', 'rn', 'rp', 'rs', 'rsh', 'rst', 'rt', 'rth', 'tch'
	]
};

export const SHADER = {
	stars: {
		vertex: `attribute float size;
    varying vec3 vColor;
    #ifdef USE_FOG
      varying float fogDepth;
    #endif
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 200.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
    }`,
		fragment: `varying vec3 vColor;
    varying vec2 vUv;
    uniform sampler2D texture;
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
   gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
  }`
	},
	glow: {
		vertex: `uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
		fragment: `uniform vec3 glowColor;
    varying float intensity;
    void main() {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4( glow, 1.0 );
    }`
	},
	glow2: {
		vertex: `varying vec3 vVertexWorldPosition;
		varying vec3 vVertexNormal;
		void main() {
			vVertexNormal = normalize(normalMatrix * normal);
			vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
		fragment: `uniform vec3 color;
		uniform float coeficient;
		uniform float power;
		varying vec3 vVertexNormal;
		varying vec3 vVertexWorldPosition;
		void main() {
			vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;
			vec3 viewCameraToVertex = (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
			viewCameraToVertex = normalize(viewCameraToVertex);
			float intensity = pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);
			gl_FragColor = vec4(color, intensity);
		}`
	},
	pcss: {
		fragment: `#define LIGHT_WORLD_SIZE 0.005
		#define LIGHT_FRUSTUM_WIDTH 3.75
		#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
		#define NEAR_PLANE 9.5

		#define NUM_SAMPLES 17
		#define NUM_RINGS 11
		#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
		#define PCF_NUM_SAMPLES NUM_SAMPLES

		vec2 poissonDisk[NUM_SAMPLES];

		void initPoissonSamples( const in vec2 randomSeed ) {
			float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
			float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( randomSeed ) * PI2;
			float radius = INV_NUM_SAMPLES;
			float radiusStep = radius;

			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
				radius += radiusStep;
				angle += ANGLE_STEP;
			}
		}

		float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
			return (zReceiver - zBlocker) / zBlocker;
		}

		float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
			// This uses similar triangles to compute what
			// area of the shadow map we should search
			float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
			float blockerDepthSum = 0.0;
			int numBlockers = 0;

			for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
				float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
				if ( shadowMapDepth < zReceiver ) {
					blockerDepthSum += shadowMapDepth;
					numBlockers ++;
				}
			}

			if( numBlockers == 0 ) return -1.0;

			return blockerDepthSum / float( numBlockers );
		}

		float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
			float sum = 0.0;
			for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
				float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
				if( zReceiver <= depth ) sum += 1.0;
			}
			for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
				float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
				if( zReceiver <= depth ) sum += 1.0;
			}
			return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
		}

		float PCSS ( sampler2D shadowMap, vec4 coords ) {
			vec2 uv = coords.xy;
			float zReceiver = coords.z; // Assumed to be eye-space z in this code

			initPoissonSamples( uv );
			// STEP 1: blocker search
			float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );

			//There are no occluders so early out (this saves filtering)
			if( avgBlockerDepth == -1.0 ) return 1.0;

			// STEP 2: penumbra size
			float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
			float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;

			// STEP 3: filtering
			//return avgBlockerDepth;
			return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );
		}`,
		shadow: 'return PCSS( shadowMap, shadowCoord );'
	}
};
