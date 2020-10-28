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
  scale: 1000,
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
  timeStart: Date.now(),
  time: 0.0001,
  loaded: 0,
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
};

export const LAYER = {
  ENTITY: 0,
  SYSTEM: 1,
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
    Purple: 0.9,
    Blue: 0.7,
    Green: 0.5,
    Yellow: 0.2,
    Orange: 0.15,
    Red: 0.05,
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
