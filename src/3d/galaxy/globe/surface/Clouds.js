/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import { Color } from 'three';
import CloudMap from './CloudMap';
import Random from '../../../../misc/Random';

class Clouds {
  constructor({
    rnd, size, resolution, show, color,
  }) {
    // this.view = new THREE.Object3D();
    this.seedString = rnd || 'lorem';
    this.initSeed();
    this.seed = Clouds.randRange(0, 100000);
    this.timerBank = this.seedString;
    this.show = show;
    this.materials = [];
    this.roughness = 0.9;
    this.metalness = 0.5;
    this.normalScale = 5.0;
    this.opacity = 0.9;
    this.sphere = new THREE.Mesh();

    this.resolution = resolution;
    this.size = size * 1.01;

    this.color = color || Clouds.randomizeColor();

    // this.cloudColor = [ this.color.r * 255, this.color.g * 255, this.color.b * 255 ];

    this.cloudMaps = [];

    this.setup();

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

  setup() {
    this.cloudMap = new CloudMap(this.resolution, this.show);
    this.cloudMaps = this.cloudMap.maps;

    for (let i = 0; i < 6; i += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: this.color,
        emissive: this.color,
        emissiveIntensity: 0.02,
        alphaTest: 0,
        transparent: true,
      });
      this.materials[i] = material;
    }

    const geo = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    const radius = this.size;
    for (let v = 0; v < geo.vertices.length; v += 1) {
      const vertex = geo.vertices[v];
      vertex.normalize().multiplyScalar(radius);
    }
    Clouds.computeGeometry(geo);
    this.geometry = new THREE.BufferGeometry().fromGeometry(geo);
    geo.dispose();
    this.sphere.geometry = this.geometry;
    this.sphere.material = this.materials;
    this.sphere.receiveShadow = true;
    this.sphere.visible = false;
    this.sphere.renderOrder = 1;

    // this.view.add(this.sphere);
  }

  render(props, callback) {
    const size = {
      min: 0.1,
      max: 1,
    };

    this.cloudMap.render({
      timerBank: this.timerBank,
      seed: this.seed,
      resolution: this.resolution,
      res1: Clouds.randRange(size.min, size.max),
      res2: Clouds.randRange(size.min, size.max),
      resMix: Clouds.randRange(size.min, size.max),
      mixScale: Clouds.randRange(size.min, size.max),
    }, () => {
      this.updateMaterial();
      this.sphere.visible = true;
      console.log(`[${this.timerBank}] CALLBACK CLOUDS: ${this.resolution}`);
      if (callback) {
        callback();
      }
    });
  }

  initSeed() {
    window.seed = new Random(this.seedString, 'clouds');
  }

  updateMaterial() {
    if (this.show) {
      for (let i = 0; i < 6; i += 1) {
        const material = this.materials[i];
        material.roughness = this.roughness;
        material.metalness = this.metalness;
        material.map = this.cloudMaps[i];
        material.color = this.color;
        // material.alphaMap = this.cloudMaps[i],
        // material.bumpMap = this.cloudMaps[i],
        // material.bumpScale = 1.0,
        material.opacity = this.opacity;
        material.needsUpdate = true;
      }
    }
  }

  static randomizeColor() {
    return new Color(
      Clouds.randRange(0.5, 1.0),
      Clouds.randRange(0.5, 1.0),
      Clouds.randRange(0.5, 1.0),
    );
  }

  static randRange(low, high) {
    const range = high - low;
    const n = window.seed.rnd() * range;
    return low + n;
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