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
        .geometry(new THREE.SphereBufferGeometry(this.size, 32, 32))
        .material(this.atmosphereMaterial, {
          'uniforms.size.value': this.size,
          'uniforms.thickness.value': this.thickness,
          'uniforms.opacity.value': this.opacity,
          'uniforms.power.value': this.power,
          'uniforms.color.value': this.color,
          'uniforms.color2.value': this.color2,
          'uniforms.inner.value': true,
          side: THREE.FrontSide,
        })
        .mesh({
          name: 'Atmosphere inside',
          castShadow: false,
          receiveShadow: false,
          renderOrder: 1,
        })
        .add(parent);
    }
    if (this.outer) {
      this.atmosphereOut = new Thing('glowOutside')
        .geometry(new THREE.SphereBufferGeometry(this.size, 32, 32)) // + thickness
        .material(this.atmosphereMaterial, {
          'uniforms.size.value': this.size,
          'uniforms.thickness.value': this.thickness,
          'uniforms.opacity.value': this.opacity,
          'uniforms.power.value': this.power,
          'uniforms.color.value': this.color,
          'uniforms.color2.value': this.color2,
          'uniforms.inner.value': false,
          side: THREE.BackSide,
          depthTest: this.depth,
        })
        .mesh({
          name: 'Atmosphere outside',
          castShadow: false,
          receiveShadow: false,
          renderOrder: 1,
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
          size: { type: 'f', value: 1.0 },
          thickness: { type: 'f', value: 1.0 },
          opacity: { type: 'f', value: 1.0 },
          inner: { type: 'f', value: 0.0 },
          power: { type: 'f', value: 2.0 },
          color: { type: 'c', value: new THREE.Color(0xffffff) },
          color2: { type: 'c', value: new THREE.Color(0xffffff) },
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
