import * as THREE from 'three'
import vertShader from 'shaders/texture.vert'
import fragShader from 'shaders/nebula.frag'
import Map from 'views/Map.js'

export default class NebulaMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0},
          nebulaeMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.seed.value = props.seed;
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.res1.value = props.res1;
      this.mats[i].uniforms.res2.value = props.res2;
      this.mats[i].uniforms.resMix.value = props.resMix;
      this.mats[i].uniforms.mixScale.value = props.mixScale;
      this.mats[i].uniforms.nebulaeMap.value = props.nebulaeMap;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }


}
