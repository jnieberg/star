import * as THREE from 'three';
import ThingList from './object/ThingList';

export const TD = {
  entity: {
    system: {
      size: 100,
      radius: 2,
      density: 0.0003,
    },
    nebula: {
      size: 100,
      radius: 10,
      density: 512,
    },
  },
  scale: 10000,
  camera: undefined,
  clock: undefined,
  scene: undefined,
  canvas: undefined,
  renderer: undefined,
  labelRenderer: undefined,
  bloomComposer: undefined,
  finalComposer: undefined,
  raycaster: undefined,
  texture: {
    manager: undefined,
    star: {
      small: undefined,
      surface: undefined,
      rings: undefined,
      aura: undefined,
    },
    planet: {
      rings: undefined,
    },
    misc: {
      nebula: [],
    },
  },
  material: {
    stars: undefined,
    nebulas: undefined,
    grid: undefined,
  },
  galaxy: undefined,
  system: undefined,
  star: undefined,
  planet: undefined,
  moon: undefined,
  label: undefined,
};

export const EVENT = {
  controls: undefined,
  mouse: new THREE.Vector2(),
  mouse2d: new THREE.Vector2(),
};

export const LOD = {
  LOW: 0,
  HIGH: 1,
};

export const MISC = {
  interrupt: false,
  lod: LOD.LOW,
  timers: {},
  // timeStart: Date.now(),
  time: 0.0001,
  loaded: false,
  things: new ThingList(),
  colorHelper: new THREE.Color(),
  colorHelper2: new THREE.Color(),
  colorHelper3: new THREE.Color(),
  reload: false,
  debug: undefined,
  interval: 200,
  intervalShadow: 200,
  camera: {
    near: 0.0000001,
    fade: 350,
    far: 700,
  },
  KELVIN: -273.25,
  queued: false,
};

export const LAYER = {
  ENTITY: 0,
  SYSTEM: 1,
};

export const STAR = [
  [
    -0.01,
    {
      color: 'Brown',
      class: 'R',
      hue: 0,
      lightness: 0.1,
      temperature: 1300,
      size: 0.2,
    },
    0.0,
    {
      color: 'Brown',
      class: 'R',
      hue: 0,
      lightness: 0.1,
      temperature: 1300,
      size: 0.2,
    },
  ],
  [
    0.1,
    {
      color: 'Red',
      class: 'M',
      hue: 0,
      lightness: 0.7,
      temperature: 2000,
      size: 0.4,
    },
  ],
  [
    0.3,
    {
      color: 'Orange',
      class: 'K',
      hue: 30 / 360,
      lightness: 0.7,
      temperature: 3700,
      size: 0.7,
    },
  ],
  [
    0.5,
    {
      color: 'Yellow',
      class: 'G',
      hue: 60 / 360,
      lightness: 0.7,
      temperature: 5200,
      size: 0.96,
    },
  ],
  [
    0.6,
    {
      color: 'Yellow-White',
      class: 'F',
      hue: 60 / 360,
      lightness: 0.85,
      temperature: 6000,
      size: 1.15,
    },
  ],
  [
    0.7,
    {
      color: 'White',
      class: 'A',
      hue: 60 / 360,
      lightness: 1.0,
      temperature: 7500,
      size: 1.4,
    },
  ],
  [
    0.7,
    {
      color: 'White',
      class: 'A',
      hue: 180 / 360,
      lightness: 1.0,
      temperature: 7500,
      size: 1.4,
    },
  ],
  [
    0.85,
    {
      color: 'Blue-White',
      class: 'B',
      hue: 210 / 360,
      lightness: 0.85,
      temperature: 10000,
      size: 1.8,
    },
  ],
  [
    1.0,
    {
      color: 'Blue',
      class: 'O',
      hue: 240 / 360,
      lightness: 0.7,
      temperature: 33000,
      size: 6.6,
    },
  ],
];

// Magenta 300
// Blue-Magenta 270
// Blue 240
// Cyan-Blue 210
// Cyan 180
// Green-Cyan 150
// Green 120
// Green-Yellow 90
// Yellow 60
// Orange 30
// Red 0
export const GLOBE = {
  VOLCANIC: {
    climate: 'Volcanic',
    land: { hue: [0, 45], saturation: [0.0, 0.7], lightness: [0.3, 0.7] },
    liquid: { hue: [0, 45], saturation: [0.8, 1.0], lightness: [0.4, 0.7] },
    glow: true,
  },
  HOT: {
    climate: 'Hot',
    land: { hue: [0, 45], saturation: [0.2, 0.7], lightness: [0.2, 0.7] },
    liquid: { hue: [0, 45], saturation: [0.2, 1.0], lightness: [0.3, 0.7] },
  },
  BARREN: {
    climate: 'Barren',
    land: { saturation: [0.0, 0.2], lightness: [0.1, 0.7] },
  },
  DESERT: {
    climate: 'Desert',
    land: { hue: [15, 60], saturation: [0.1, 0.7], lightness: [0.3, 0.4] },
  },
  SAVANNAH: {
    climate: 'Savannah',
    land: { hue: [15, 60], saturation: [0.1, 0.7], lightness: [0.1, 0.4] },
    liquid: { hue: [150, 240], saturation: [0.3, 1.0], lightness: [0.3, 0.7] },
  },
  OCEAN: {
    climate: 'Ocean',
    liquid: { hue: [180, 240], saturation: [0.3, 1.0], lightness: [0.3, 0.7] },
  },
  JUNGLE: {
    climate: 'Jungle',
    land: { hue: [90, 150], saturation: [0.2, 0.7], lightness: [0.3, 0.7] },
  },
  SWAMP: {
    climate: 'Swamp',
    land: { hue: [75, 120], saturation: [0.5, 0.7], lightness: [0.2, 0.4] },
    liquid: { hue: [75, 120], saturation: [0.5, 0.7], lightness: [0.1, 0.4] },
  },
  MODERATE: {
    climate: 'Moderate',
    land: { hue: [90, 120], saturation: [0.1, 1.0], lightness: [0.3, 0.7] },
    liquid: { hue: [150, 240], saturation: [0.3, 1.0], lightness: [0.3, 0.7] },
  },
  TUNDRA: {
    climate: 'Tundra',
    land: { hue: [30, 150], saturation: [0.2, 0.8], lightness: [0.2, 0.8] },
    liquid: { hue: [150, 240], saturation: [0.0, 1.0], lightness: [0.7, 1.0] },
  },
  ARCTIC: {
    climate: 'Arctic',
    land: { hue: [150, 240], saturation: [0.2, 7.0], lightness: [0.2, 1.0] },
    liquid: { hue: [150, 240], saturation: [0.3, 7.0], lightness: [0.2, 1.0] },
  },
  ICY: {
    climate: 'Icy',
    land: { hue: [150, 240], saturation: [0.2, 1.0], lightness: [0.7, 1.0] },
    liquid: { hue: [150, 240], saturation: [0.3, 1.0], lightness: [0.7, 1.0] },
  },
  TOXIC: {
    climate: 'Toxic',
    land: { hue: [90, 150], saturation: [0.2, 1.0], lightness: [0.3, 0.7] },
    liquid: { hue: [90, 150], saturation: [0.5, 1.0], lightness: [0.3, 0.7] },
    glow: true,
  },
  RADIOACTIVE: {
    climate: 'Radioactive',
    land: { hue: [150, 180], saturation: [0.3, 1.0], lightness: [0.3, 0.7] },
    liquid: { hue: [150, 180], saturation: [0.5, 1.0], lightness: [0.3, 0.7] },
    glow: true,
  },
  ALIEN: {
    climate: 'Alien',
    land: { hue: [240, 330], saturation: [0.2, 1.0], lightness: [0.0, 0.7] },
    liquid: { hue: [300, 360], saturation: [0.2, 1.0], lightness: [0.0, 0.7] },
    glow: true,
  },
};

export const BODY = {
  gas: {
    Dust: 0,
    Moist: 1,
  },
};

export const COLOR = {
  hue: {
    Red_: 360 / 360,
    Purple: 300 / 360,
    Blue: 240 / 360,
    Green: 120 / 360,
    Yellow: 60 / 360,
    Orange: 30 / 360,
    Red: 0 / 360,
  },
  saturation: {
    '': 10,
    Pale: 0.3,
    Grey: 0.1,
  },
  lightness: {
    White: 10,
    Bright: 0.95,
    '': 0.7,
    Dark: 0.3,
    Black: 0.05,
  },
};
