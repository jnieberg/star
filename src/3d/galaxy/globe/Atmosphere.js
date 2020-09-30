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
      thickness = 0.1,
      color: colorS = 'rgba(255, 255, 255, 1.0)',
      colorInner: colorInnerS = colorS,
      opacity = 0.5,
      opacityInner = opacity * 0.5,
      power = 1.0,
    } = {}
  ) {
    this.color = new THREE.Color(colorS);
    this.colorInner = new THREE.Color(colorInnerS);
    this.power = power;
    this.atmosphereIn = new Thing('glowInside')
      .geometry(new THREE.SphereBufferGeometry(size, 64, 64))
      .material(Atmosphere.atmosphereMaterial(blending), {
        'uniforms.reverse.value': 1.0,
        'uniforms.size.value': size * 0.8,
        'uniforms.thickness.value': size * 0.2,
        'uniforms.opacity.value': opacityInner,
        'uniforms.power.value': this.power,
        'uniforms.color.value': this.colorInner,
        side: THREE.BackSide,
        depthTest: false,
      })
      .mesh({
        name: 'Atmosphere inside',
        castShadow: false,
        receiveShadow: false,
        renderOrder: 1,
      })
      .add(mesh);
    this.atmosphereOut = new Thing('glowOutside')
      .geometry(new THREE.SphereBufferGeometry(size + thickness, 64, 64))
      .material(Atmosphere.atmosphereMaterial(blending), {
        'uniforms.size.value': size,
        'uniforms.thickness.value': thickness,
        'uniforms.opacity.value': opacity,
        'uniforms.power.value': this.power,
        'uniforms.color.value': this.color,
        side: THREE.BackSide,
        depthTest: false,
      })
      .mesh({
        name: 'Atmosphere outside',
        castShadow: false,
        receiveShadow: false,
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
          reverse: { type: 'f', value: 0.0 },
          power: { type: 'f', value: 1.0 },
          color: { type: 'c', value: new THREE.Color(0xffff00) },
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
