/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import Biome from './Biome';
import NoiseMap from './NoiseMap';
import TextureMap from './TextureMap';
import NormalMap from './NormalMap';
import RoughnessMap from './RoughnessMap';
import Clouds from './Clouds';
import { MISC, TD } from '../../../../variables';
import Random from '../../../../misc/Random';
import setColor from '../../../../misc/color';
import wait from '../../../tools/wait';

class GlobeSurface {
  constructor({ body, resolution, detail = 1, glow = 0.0 }) {
    this.random = new Random(
      `${body.type}_surface_${body.system.key}_${body.grandParentId}_${body.parentId}_${body.index}`
    );
    MISC.interrupt = false; // true
    this.body = body;
    this.glow = glow;
    this.timerBank = this.random.seed;
    this.ground = new THREE.Mesh();

    this.materials = [];
    this.detail = detail;
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 3.0;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];
    this.resolution = resolution || 256;
    this.segments = resolution / 32 > 16 ? resolution / 32 : 16;
    this.hasClouds = !!this.body.clouds;
    this.clouds = this.createClouds();
  }

  render({ biome } = {}) {
    return new Promise((resolve) => {
      // wait(this.timerBank).then(() => {
      this.biome =
        biome ||
        new Biome({
          random: this.random,
          show: this.resolution === 512,
          land: this.body.land,
          liquid: this.body.liquid,
          glow: this.glow,
        });
      // wait(this.timerBank).then(() => {
      this.createScene();
      this.renderScene().then(resolve);
      // console.log(`[${this.timerBank}] RENDER: ${this.resolution}`);
      // });
      // });
    });
  }

  createScene() {
    this.heightMap = new NoiseMap(this.resolution, this.detail > -1); // land
    this.heightMaps = this.heightMap.maps;

    this.moistureMap = new NoiseMap(this.resolution, this.detail > -1); // aftertouch
    this.moistureMaps = this.moistureMap.maps;

    this.textureMap = new TextureMap(this.resolution, this.detail > -1); // liquid
    this.textureMaps = this.textureMap.maps;

    this.normalMap = new NormalMap(this.resolution, this.detail > 0); // height map
    this.normalMaps = this.normalMap.maps;

    this.roughnessMap = new RoughnessMap(this.resolution, this.detail > 0); // liquid light reflection
    this.roughnessMaps = this.roughnessMap.maps;
    for (let i = 0; i < 6; i += 1) {
      let material;
      if (this.glow) {
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xffffff),
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: this.glow,
          alphaTest: 0,
        });
      } else {
        const color = this.body.level > 0.5 ? this.body.liquid : this.body.land;
        setColor(1, color.hue, color.saturation, color.lightness, 'hsl');
        material = new THREE.MeshStandardMaterial({
          color: MISC.colorHelper, // new THREE.Color(0xffffff),
          transparent: true,
          alphaTest: 0,
        });
      }
      this.materials[i] = material;
    }
    const geo = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    const radius = this.body.size * 0.0001 * TD.scale;
    for (let v = 0; v < geo.vertices.length; v += 1) {
      const vertex = geo.vertices[v];
      vertex.normalize().multiplyScalar(radius);
    }
    GlobeSurface.computeGeometry(geo);
    this.geometry = new THREE.BufferGeometry().fromGeometry(geo);
    geo.dispose();
    if (this.glow) {
      this.ground.onBeforeRender = (rend) => rend.clearDepth();
    }
    this.ground.geometry = this.geometry;
    this.ground.material = this.materials;
    this.ground.castShadow = true;
    this.ground.receiveShadow = true;
    // this.ground.onBeforeRender = (rend) => rend.clearDepth();
    this.ground.visible = false;
    return this.ground;
  }

  renderScene() {
    return new Promise((grandResolve) => {
      this.updateNormalScaleForRes(this.resolution);

      this.renderBiomeTexture();

      let resMin = 0.01; // 0.01
      let resMax = 5.0; // 5.0
      const mixMin = 0.5; // 0.5
      const mixMax = 1.0; // 1.0

      MISC.interrupt = false;
      this.random.seed = 'map';

      const heightMap = new Promise((resolve) =>
        this.heightMap
          .render({
            timerBank: this.timerBank,
            seed: this.random.float(0, 1000),
            resolution: this.resolution,
            res1: this.random.float(resMin, resMax),
            res2: this.random.float(resMin, resMax),
            resMix: this.random.float(resMin, resMax),
            mixScale: this.random.float(mixMin, mixMax),
            doesRidged: this.random.int(3),
            // doesRidged: -1,
          })
          .then(resolve)
      );
      const moistureMap = new Promise((resolve) => {
        this.random.seed = 'res_map';
        const resMod = this.random.float(3, 10); // 3, 10
        resMax *= resMod;
        resMin *= resMod;

        this.random.seed = 'map';
        this.moistureMap
          .render({
            timerBank: this.timerBank,
            seed: this.random.float(1000, 2000),
            resolution: this.resolution,
            res1: this.random.float(resMin, resMax),
            res2: this.random.float(resMin, resMax),
            resMix: this.random.float(resMin, resMax),
            mixScale: this.random.float(mixMin, mixMax),
            doesRidged: this.random.int(3),
            // doesRidged: -1,
          })
          .then(resolve);
      });
      const textureMap = new Promise((resolve) =>
        this.textureMap
          .render({
            timerBank: this.timerBank,
            resolution: this.resolution,
            heightMaps: this.heightMaps,
            moistureMaps: this.moistureMaps,
            biomeMap: this.biome.texture,
          })
          .then(resolve)
      );
      const normalMap = new Promise((resolve) =>
        this.normalMap
          .render({
            timerBank: this.timerBank,
            resolution: this.resolution,
            waterLevel: this.body.liquid.level,
            heightMaps: this.heightMaps,
            textureMaps: this.textureMaps,
          })
          .then(resolve)
      );
      const roughnessMap = new Promise((resolve) =>
        // this.updateMaterial();
        this.roughnessMap
          .render({
            timerBank: this.timerBank,
            resolution: this.resolution,
            heightMaps: this.heightMaps,
            waterLevel: this.body.liquid.level,
          })
          .then(resolve)
      );
      const clouds = new Promise((resolve) => {
        if (this.hasClouds) {
          this.clouds.render().then(resolve);
        } else {
          resolve();
        }
      });
      heightMap
        .then(moistureMap)
        .then(textureMap)
        .then(normalMap)
        .then(roughnessMap)
        .then(clouds)
        .then(() => {
          this.updateMaterial();
          this.ground.visible = true;
          // console.log(`[${this.timerBank}] CALLBACK PLANET: ${this.resolution}`);
          this.createGlow().then(grandResolve);
        });
    });
  }

  updateMaterial() {
    for (let i = 0; i < 6; i += 1) {
      const material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;

      material.map = this.textureMaps[i];
      material.emissiveMap = this.textureMaps[i];
      material.normalMap = this.normalMaps[i];
      material.normalScale = new THREE.Vector2(
        this.normalScale,
        this.normalScale
      );
      material.roughnessMap = this.roughnessMaps[i];
      material.metalnessMap = this.roughnessMaps[i];
      material.color = new THREE.Color(0xffffff);
      material.needsUpdate = true;
    }
  }

  renderBiomeTexture() {
    if (!this.biome.texture) {
      this.biome.generateTexture({ waterLevel: this.body.liquid.level });
    }
  }

  createClouds() {
    if (this.hasClouds && this.body.clouds) {
      setColor(
        1,
        this.body.clouds.hue,
        this.body.clouds.saturation,
        this.body.clouds.lightness,
        'hsl'
      );
      return new Clouds({
        // rnd: this.seedString,
        random: this.random,
        size: this.body.size * 0.0001,
        resolution: 512,
        show: true,
        color: MISC.colorHelper,
        opacity: this.body.clouds.density,
        blend: this.body.gasBlend,
      });
      // this.ground.add(this.clouds.view);
    }
    return undefined;
  }

  createGlow() {
    return new Promise((resolve) => {
      if (!this.glow && this.body.glow) {
        const glowSurface = new GlobeSurface({
          body: this.body,
          resolution: this.resolution,
          detail: 0,
          glow: this.body.glow,
        });
        glowSurface.render().then(resolve);
        this.groundGlow = glowSurface.ground;
        this.groundGlow.name =
          this.type === 'planet' ? 'Planet low' : 'Moon low';
        this.groundGlow.castShadow = false;
        this.groundGlow.receiveShadow = false;
        this.ground.add(this.groundGlow);
      } else {
        resolve();
      }
    });
  }

  updateNormalScaleForRes(value) {
    switch (value) {
      case 32:
        this.normalScale = 0.03;
        break;
      case 64:
        this.normalScale = 0.05;
        break;
      case 128:
        this.normalScale = 0.1;
        break;
      case 256:
        this.normalScale = 0.15;
        break;
      case 512:
        this.normalScale = 0.25;
        break;
      case 1024:
      default:
        this.normalScale = 0.5;
        break;
    }
  }

  static computeGeometry(geometry) {
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
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

export default GlobeSurface;
