/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import Biome from './Biome';
import NoiseMap from './NoiseMap';
import TextureMap from './TextureMap';
import NormalMap from './NormalMap';
import RoughnessMap from './RoughnessMap';
import Clouds from './Clouds';
import { MISC } from '../../../../variables';
import Random from '../../../../misc/Random';
import wait from '../../../tools/wait';

class GlobeSurface {
  constructor(
    {
      rnd,
      size,
      resolution,
      obj,
      biome,
      detail,
      hasClouds = false,
      cloudColor,
      metal,
      fluid,
    },
    callback
  ) {
    MISC.interrupt = false; // true
    this.seedString = rnd || 'lorem';
    this.initSeed();
    this.timerBank = this.seedString;
    this.ground = new THREE.Mesh();
    this.obj = obj;

    this.materials = [];
    this.detail = detail;
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 3.0;
    this.size = size || 1;
    this.hasClouds = hasClouds && this.detail === 0;
    this.metal = metal;
    this.fluid = fluid;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];
    this.resolution = resolution || 256;
    this.segments = resolution / 32 > 16 ? resolution / 32 : 16;
    this.cloudColor = cloudColor;
    this.cloudDensity = hasClouds.density;
    this.clouds = undefined;
    if (this.hasClouds) {
      this.clouds = this.createClouds();
    }
    wait(this.timerBank, () => {
      this.initSeed();
      this.biome =
        biome ||
        new Biome({
          metal: this.metal,
          fluid: this.fluid,
        });
      wait(this.timerBank, () => {
        this.createScene();
        this.render(resolution, callback);
      });
    });
  }

  render(detail, callback) {
    this.resolution = detail || 256;
    // console.log(`[${this.timerBank}] RENDER: ${this.resolution}`);
    // wait(() => {
    this.renderScene(callback);
    // });
  }

  initSeed() {
    window.seed = new Random(this.seedString, 'surface');
  }

  createScene() {
    this.heightMap = new NoiseMap(this.resolution);
    this.heightMaps = this.heightMap.maps;

    this.moistureMap = new NoiseMap(this.resolution);
    this.moistureMaps = this.moistureMap.maps;

    this.textureMap = new TextureMap(this.resolution);
    this.textureMaps = this.textureMap.maps;

    this.normalMap = new NormalMap(this.resolution);
    this.normalMaps = this.normalMap.maps;

    this.roughnessMap = new RoughnessMap(this.resolution);
    this.roughnessMaps = this.roughnessMap.maps;

    for (let i = 0; i < 6; i += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff),
        transparent: true,
        // opacity: 0,
        alphaTest: 0,
      });
      this.materials[i] = material;
    }
    const geo = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    const radius = this.size;
    for (let v = 0; v < geo.vertices.length; v += 1) {
      const vertex = geo.vertices[v];
      vertex.normalize().multiplyScalar(radius);
    }
    GlobeSurface.computeGeometry(geo);
    this.geometry = new THREE.BufferGeometry().fromGeometry(geo);
    geo.dispose();
    this.ground.geometry = this.geometry;
    this.ground.material = this.materials;
    this.ground.castShadow = true;
    this.ground.receiveShadow = true;
    this.ground.visible = false;
    // this.view.add(this.ground);
  }

  renderCallback(message, callback) {
    this.updateMaterial();
    this.ground.visible = true;
    // console.log(`[${this.timerBank}] ${message} PLANET: ${this.resolution}`);
    if (callback) {
      callback();
    }
  }

  renderScene(callback) {
    this.initSeed();
    this.seed = GlobeSurface.randRange(0, 1) * 100000.0;
    this.updateNormalScaleForRes(this.resolution);

    this.renderBiomeTexture();

    let resMin = 0.01;
    let resMax = 5.0;

    MISC.interrupt = false;
    this.initSeed();
    this.heightMap.render(
      {
        timerBank: this.timerBank,
        seed: this.seed,
        resolution: this.resolution,
        res1: GlobeSurface.randRange(resMin, resMax),
        res2: GlobeSurface.randRange(resMin, resMax),
        resMix: GlobeSurface.randRange(resMin, resMax),
        mixScale: GlobeSurface.randRange(0.5, 1.0),
        doesRidged: Math.floor(GlobeSurface.randRange(0, 4)),
        // doesRidged: 1
      },
      () => {
        this.initSeed();
        // this.updateMaterial();
        const resMod = GlobeSurface.randRange(3, 10);
        resMax *= resMod;
        resMin *= resMod;

        this.moistureMap.render(
          {
            timerBank: this.timerBank,
            seed: this.seed + 392.253,
            resolution: this.resolution,
            res1: GlobeSurface.randRange(resMin, resMax),
            res2: GlobeSurface.randRange(resMin, resMax),
            resMix: GlobeSurface.randRange(resMin, resMax),
            mixScale: GlobeSurface.randRange(0.5, 1.0),
            doesRidged: Math.floor(GlobeSurface.randRange(0, 4)),
            // doesRidged: 0
          },
          () => {
            // this.updateMaterial();
            this.textureMap.render(
              {
                timerBank: this.timerBank,
                resolution: this.resolution,
                heightMaps: this.heightMaps,
                moistureMaps: this.moistureMaps,
                biomeMap: this.biome.texture,
              },
              () => {
                // this.updateMaterial();
                this.normalMap.render(
                  {
                    timerBank: this.timerBank,
                    resolution: this.resolution,
                    waterLevel: this.fluid.level,
                    heightMaps: this.heightMaps,
                    textureMaps: this.textureMaps,
                  },
                  () => {
                    // this.updateMaterial();
                    this.roughnessMap.render(
                      {
                        timerBank: this.timerBank,
                        resolution: this.resolution,
                        heightMaps: this.heightMaps,
                        waterLevel: this.fluid.level,
                      },
                      () => {
                        if (this.hasClouds) {
                          this.clouds.render(
                            {
                              timerBank: this.timerBank,
                              waterLevel: this.fluid.level,
                            },
                            () => {
                              this.renderCallback('CALLBACK', callback);
                            }
                          );
                        } else {
                          this.renderCallback('CALLBACK', callback);
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  updateMaterial() {
    for (let i = 0; i < 6; i += 1) {
      const material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;

      material.map = this.textureMaps[i];
      material.normalMap = this.normalMaps[i];
      material.normalScale = new THREE.Vector2(
        this.normalScale,
        this.normalScale
      );
      material.roughnessMap = this.roughnessMaps[i];
      material.metalnessMap = this.roughnessMaps[i];
      // material.opacity = 1;
      material.needsUpdate = true;
    }
  }

  renderBiomeTexture() {
    if (!this.biome.texture) {
      this.biome.generateTexture({ waterLevel: this.fluid.level });
    }
  }

  createClouds() {
    return new Clouds({
      rnd: this.seedString,
      size: this.size,
      resolution: 512,
      show: true,
      color: this.cloudColor,
      opacity: this.cloudDensity,
    });
    // this.ground.add(this.clouds.view);
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
        this.normalScale = 0.5;
        break;
      default:
        this.normalScale = 0;
        break;
    }
  }

  static randRange(low, high) {
    const range = high - low;
    const n = window.seed.rnd() * range;
    return low + n;
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
