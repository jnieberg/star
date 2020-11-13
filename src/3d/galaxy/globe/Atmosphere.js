import * as THREE from 'three';

import vertShader from '../../../shaders/atmosphere.vert';
import fragShader from '../../../shaders/atmosphere.frag';
import Thing from '../../../object/Thing';

export default class Atmosphere {
  constructor({
    size,
    blending = THREE.NormalBlending,
    thickness = 0.1,
    color = 'rgba(255, 255, 255, 1.0)',
    color2 = color,
    opacity = 0.5,
    outer = true,
    inner = true,
    power = 2.0,
    depth = true,
  } = {}) {
    this.size = size;
    this.thickness = thickness;
    this.color = new THREE.Color(color);
    this.color2 = new THREE.Color(color2);
    this.blending = blending;
    this.outer = outer;
    this.inner = inner;
    this.power = power;
    this.depth = depth;
    this.opacity = opacity;
  }

  add(parent) {
    if (this.inner) {
      this.atmosphereIn = new Thing('glowInside')
        .geometry(new THREE.SphereBufferGeometry(this.size, 64, 64))
        .material(this.atmosphereMaterial, {
          'uniforms.inner.value': true,
          side: THREE.FrontSide,
        })
        .mesh({
          name: 'Atmosphere inside',
          castShadow: false,
          receiveShadow: false,
          renderOrder: 0,
          onBeforeRender: (rend) => rend.clearDepth(),
        })
        .add(parent);
    }
    if (this.outer) {
      this.atmosphereOut = new Thing('glowOutside')
        .geometry(new THREE.SphereBufferGeometry(this.size, 64, 64)) // + thickness
        .material(this.atmosphereMaterial, {
          'uniforms.inner.value': false,
          side: THREE.BackSide,
          depthTest: this.depth,
        })
        .mesh({
          name: 'Atmosphere outside',
          castShadow: false,
          receiveShadow: false,
          renderOrder: 0,
        })
        .add(parent);
    }
  }

  get atmosphereMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
          topColor: {
            type: 'c',
            value: new THREE.Color(0xff0000),
          },
          bottomColor: {
            type: 'c',
            value: new THREE.Color(0x00ff00),
          },
          size: { type: 'f', value: this.size },
          thickness: { type: 'f', value: this.thickness },
          opacity: { type: 'f', value: this.opacity },
          inner: { type: 'f', value: false },
          power: { type: 'f', value: this.power },
          color: { type: 'c', value: this.color },
          color2: { type: 'c', value: this.color2 },
        },
      ]),
      lights: true,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      blending: this.blending,
      transparent: true,
      alphaTest: 0,
    });
    return material;
  }
}
