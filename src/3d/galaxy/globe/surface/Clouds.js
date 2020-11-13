/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import { Color } from 'three';
import CloudMap from './CloudMap';
import Random from '../../../../misc/Random';
import { BODY, MISC, TD } from '../../../../variables';

class Clouds {
  constructor({
    random,
    size,
    resolution,
    show,
    color,
    opacity = 0.9,
    blend = BODY.gas.Dust,
  }) {
    this.random = random;
    // this.view = new THREE.Object3D();
    // this.seedString = rnd || 'lorem';
    // this.initSeed();
    // this.seed = this.random.float(0, 100000);
    this.timerBank = this.random.seed;
    this.show = show;
    this.materials = [];
    this.roughness = 0.9;
    this.metalness = 0.5;
    this.normalScale = 5.0;
    this.opacity = opacity;
    this.blend =
      blend === BODY.gas.Dust ? THREE.NormalBlending : THREE.AdditiveBlending;

    this.resolution = resolution;
    this.size = size;

    this.color = color || new Color(1.0, 1.0, 1.0);

    // this.cloudColor = [ this.color.r * 255, this.color.g * 255, this.color.b * 255 ];

    this.cloudMap = new CloudMap(this.resolution, this.show);
    this.cloudMaps = this.cloudMap.maps;
    const setupIn = this.setup({
      inner: true,
    });
    this.sphereIn = setupIn.sphere;
    this.materialsIn = setupIn.materials;
    const setup = this.setup();
    this.sphere = setup.sphere;
    this.materials = setup.materials;

    // const cloudControl = window.gui.add(this, 'clouds', 0.0, 1.0);
    // cloudControl.onChange(value => {
    //   this.updateMaterial();
    // });

    // const colorControl = window.gui.addColor(this, 'cloudColor');
    // colorControl.onChange(value => {
    //   this.color.r = value[0] / 255;
    //   this.color.g = value[1] / 255;
    //   this.color.b = value[2] / 255;
    //   this.updateMaterial();
    // });
  }

  setup({ inner = false } = {}) {
    const materials = [];
    for (let i = 0; i < 6; i += 1) {
      const material = new THREE.MeshPhongMaterial({
        color: inner ? 0x000000 : this.color,
        emissive: inner ? 0x000000 : this.color,
        emissiveIntensity: inner ? 1.0 : 0.1,
        shininess: 0,
        alphaTest: 0,
        transparent: true,
        side: THREE.FrontSide,
        blending: inner ? THREE.NormalBlending : this.blend,
        opacity: this.opacity,
      });
      materials[i] = material;
    }

    const geo = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    const radius = this.size * (inner ? 1.0 : 1.01) * TD.scale;

    for (let v = 0; v < geo.vertices.length; v += 1) {
      const vertex = geo.vertices[v];
      vertex.normalize().multiplyScalar(radius);
    }
    Clouds.computeGeometry(geo);
    const geometry = new THREE.BufferGeometry().fromGeometry(geo);
    geo.dispose();
    const sphere = new THREE.Mesh();
    sphere.geometry = geometry;
    sphere.material = materials;
    sphere.receiveShadow = true;
    sphere.visible = false;
    sphere.renderOrder = inner ? 0 : 0;
    sphere.onBeforeRender = (rend) => rend.clearDepth();
    return { sphere, materials };
  }

  render() {
    return new Promise((resolve) => {
      const size = {
        min: 0.1,
        max: 1,
      };
      this.random.seed = 'clouds';

      this.cloudMap
        .render({
          timerBank: this.timerBank,
          seed: this.random.float(0, 1000),
          resolution: this.resolution,
          res1: this.random.float(size.min, size.max),
          res2: this.random.float(size.min, size.max),
          resMix: this.random.float(size.min, size.max),
          mixScale: this.random.float(size.min, size.max),
        })
        .then(() => {
          this.updateMaterial();
          this.sphere.visible = true;
          this.sphereIn.visible = true;
          // console.log(`[${this.timerBank}] CALLBACK CLOUDS: ${this.resolution}`);
          resolve();
        });
    });
  }

  updateMaterial() {
    if (this.show) {
      for (let i = 0; i < 6; i += 1) {
        const material = this.materials[i];
        material.roughness = this.roughness;
        material.metalness = this.metalness;
        material.map = this.cloudMaps[i];
        material.emissiveMap = this.cloudMaps[i];
        material.needsUpdate = true;

        const materialIn = this.materialsIn[i];
        materialIn.roughness = this.roughness;
        materialIn.metalness = this.metalness;
        materialIn.map = this.cloudMaps[i];
        materialIn.emissiveMap = this.cloudMaps[i];
        materialIn.needsUpdate = true;
      }
    }
  }

  static computeGeometry(geometry) {
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    geometry.computeMorphNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.colorsNeedUpdate = true;
    geometry.lineDistancesNeedUpdate = true;
    geometry.groupsNeedUpdate = true;
  }
}

export default Clouds;
