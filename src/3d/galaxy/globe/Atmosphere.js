import * as THREE from 'three';

import vertShader from '../../../shaders/atmosphere.vert';
import fragShader from '../../../shaders/atmosphere.frag';
import Thing from '../../../object/Thing';

export default class Atmosphere {
  constructor(
    mesh,
    {
      size,
      blending = THREE.NormalBlending,
      thickness = size * 0.1,
      color = 'rgba(255, 255, 255, 1.0)',
      color2 = color,
      colorInner = color,
      opacity = 0.5,
      opacityInner = opacity,
      power = 2.0,
      depth = true,
    } = {}
  ) {
    this.color = new THREE.Color(color);
    this.color2 = new THREE.Color(color2);
    this.colorInner = new THREE.Color(colorInner);
    this.power = power;
    this.depth = depth;
    this.atmosphereIn = new Thing('glowInside')
      .geometry(new THREE.SphereBufferGeometry(size, 32, 32))
      .material(Atmosphere.atmosphereMaterial(blending), {
        'uniforms.direction.value': -1.0,
        'uniforms.size.value': size * 0.8,
        'uniforms.thickness.value': size * 0.2,
        'uniforms.opacity.value': opacityInner,
        'uniforms.power.value': 1.0, // this.power,
        'uniforms.color.value': this.colorInner,
        'uniforms.color2.value': this.color2,
        side: THREE.FrontSide,
      })
      .mesh({
        name: 'Atmosphere inside',
        castShadow: false,
        receiveShadow: false,
        renderOrder: 1,
      })
      .add(mesh);
    this.atmosphereOut = new Thing('glowOutside')
      .geometry(new THREE.SphereBufferGeometry(size + thickness, 32, 32))
      .material(Atmosphere.atmosphereMaterial(blending), {
        'uniforms.size.value': size,
        'uniforms.thickness.value': thickness,
        'uniforms.opacity.value': opacity,
        'uniforms.power.value': this.power,
        'uniforms.color.value': this.color,
        'uniforms.color2.value': this.color2,
        side: THREE.BackSide,
        depthTest: depth,
      })
      .mesh({
        name: 'Atmosphere outside',
        castShadow: false,
        receiveShadow: false,
        renderOrder: 2,
      })
      .add(mesh);
  }

  static atmosphereMaterial(blending = THREE.NormalBlending) {
    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
          size: { type: 'f', value: 1.0 },
          thickness: { type: 'f', value: 1.0 },
          opacity: { type: 'f', value: 1.0 },
          direction: { type: 'f', value: 1.0 },
          power: { type: 'f', value: 2.0 },
          color: { type: 'c', value: new THREE.Color(0xffffff) },
          color2: { type: 'c', value: new THREE.Color(0xffffff) },
        },
      ]),
      vertexShader: vertShader,
      fragmentShader: fragShader,
      blending,
      lights: false,
      transparent: true,
      alphaTest: 0,
    });
    return material;
  }
}
