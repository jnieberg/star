import * as THREE from "three";

export const TD = {
  camera: undefined,
  cameraNear: 0.01,
  clock: undefined,
  cameraPosition: {
    x: -1,
    y: -1,
    z: -1
  },
  refreshStars: false,
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
    material: undefined,
    geometry: undefined,
    object: undefined,
    flare: {
      sprite: undefined,
      material: undefined
    }
  },
  label: undefined
};

export const EVENT = {
  controls: undefined,
  mouse: new THREE.Vector2()
};

export const NAME_LETTERS = {
  vowels: [
    'a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'o', 'o', 'o', 'u', 'u', 'y',
    'au', 'ay', 'ee', 'ei', 'eu', 'ey', 'ie', 'oo', 'ue', 'uy'
  ],
  cons: [
    'd', 'd', 'd', 'd', 'f', 'g', 'g', 'g', 'k', 'k', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'm', 'm',
    'n', 'n', 'n', 'n', 'p', 'p', 'p', 'p', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 't', 't', 't', 't',
    'st'
  ],
  consSM: [
    'b', 'b', 'c', 'h', 'h', 'h', 'j', 'v', 'v', 'w', 'w', 'x', 'z',
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr',
    'qu', 'sl', 'sn', 'sm', 'tr', 'vl', 'vr', 'wr'
  ],
  consM: ['bb', 'dd', 'ff', 'kk', 'll', 'lv', 'mm', 'nn', 'pp', 'rr', 'ss', 'tt'],
  consME: ['lf', 'lk', 'lp', 'ls', 'mb', 'mp', 'ng', 'nk', 'np', 'rg', 'rk', 'rp', 'rs', 'rt']
}