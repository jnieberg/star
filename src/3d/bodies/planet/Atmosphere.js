import * as THREE from 'three';
import vertShader from '../../../shaders/atmosphere.vert';
import fragShader from '../../../shaders/atmosphere.frag';
import Thing from '../../../object/Thing';

export default class Atmosphere {
  constructor(mesh, {
    size, blending = THREE.NormalBlending, thickness = 0.1, color: colorS = 'rgba(255, 255, 255, 1.0)', colorInner: colorInnerS = colorS, power = 3, opacity = 0.5,
  } = {}) {
    this.color = new THREE.Color(colorS);
    this.colorInner = new THREE.Color(colorInnerS);
    this.atmosphereIn = new Thing('glowInside')
      .geometry(new THREE.SphereBufferGeometry(size, 32, 32))
      .material(Atmosphere.atmosphereMaterial(blending), {
        'uniforms.b.value': opacity * 0.75 + 0.75 - size * 0.01,
        'uniforms.p.value': power,
        'uniforms.glowColor.value': this.colorInner,
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
        'uniforms.b.value': -0.085,
        'uniforms.p.value': (thickness / size) * (1.1 - opacity * 0.5) * 20,
        'uniforms.glowColor.value': this.color,
        side: THREE.BackSide,
      })
      .mesh({
        name: 'Atmosphere outside',
        castShadow: false,
        receiveShadow: false,
        renderOrder: 0,
      })
      .add(mesh);
  }

  static atmosphereMaterial(blending = THREE.NormalBlending) {
    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
          s: { type: 'f', value: -1.0 },
          b: { type: 'f', value: 1.0 },
          p: { type: 'f', value: 2.0 },
          glowColor: { type: 'c', value: new THREE.Color(0xffff00) },
        }]),
      vertexShader: vertShader,
      fragmentShader: fragShader,
      blending,
      lights: true,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.5,
    });
    return material;
  }
}
