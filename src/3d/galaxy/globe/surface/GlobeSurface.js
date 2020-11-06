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
import wait from '../../../tools/wait';
import setColor from '../../../../misc/color';

class GlobeSurface {
  constructor(
    {
      body,
      // rnd,
      // size,
      resolution,
      // obj,
      biome,
      detail = 1,
      glow = false,
      // hasClouds = false,
      // hasGlow = false,
      // glow = false,
      // cloudColor,
      // metal,
      // liquid,
    },
    callback
  ) {
    this.random = new Random(
      `${body.type}_surface_${body.system.key}_${body.grandParentId}_${body.parentId}_${body.index}`
    );
    MISC.interrupt = false; // true
    this.body = body;
    this.glow = glow;
    // this.seedString = rnd || 'lorem';
    // this.initSeed();
    this.timerBank = this.random.seed;
    this.ground = new THREE.Mesh();
    // this.obj = obj;
    this.callback = callback || (() => {});

    this.materials = [];
    this.detail = detail;
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 3.0;
    // this.size = size || 1;
    // this.hasClouds = hasClouds && this.detail === 1;
    // this.hasGlow = hasGlow;
    // this.glow = glow;
    // this.metal = metal;
    // this.liquid = liquid;
    // this.clouds = undefined;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];
    this.resolution = resolution || 256;
    this.segments = resolution / 32 > 16 ? resolution / 32 : 16;
    // this.cloudColor = cloudColor;
    this.hasClouds = !!this.body.clouds;
    // this.cloudDensity = this.hasClouds ? this.body.clouds.density : 0;
    this.clouds = this.createClouds();
    this.render({ biome });
  }

  render({ biome }) {
    wait(this.timerBank, () => {
      // this.initSeed();
      this.biome =
        biome ||
        new Biome({
          random: this.random,
          show: this.resolution === 512,
          metal: this.body.metal,
          liquid: this.body.liquid,
          glow: this.glow,
        });
      wait(this.timerBank, () => {
        this.createScene();
        this.renderScene();
        // console.log(`[${this.timerBank}] RENDER: ${this.resolution}`);
      });
    });
  }

  createScene() {
    this.heightMap = new NoiseMap(this.resolution, this.detail > -1); // metal
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
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xffffff),
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 1.0,
          blending: THREE.AdditiveBlending,
          transparent: true,
          alphaTest: 0,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xffffff),
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
    this.ground.geometry = this.geometry;
    this.ground.material = this.materials;
    this.ground.castShadow = true;
    this.ground.receiveShadow = true;
    this.ground.visible = false;
    // this.view.add(ground);
    return this.ground;
  }

  renderCallback() {
    this.updateMaterial();
    this.ground.visible = true;
    // console.log(`[${this.timerBank}] CALLBACK PLANET: ${this.resolution}`);
    this.createGlow(() => {
      this.callback();
    });
  }

  renderScene() {
    // this.initSeed();
    this.updateNormalScaleForRes(this.resolution);

    this.renderBiomeTexture();

    let resMin = 0.01;
    let resMax = 5.0;

    MISC.interrupt = false;
    this.random.seed = 'map';

    this.heightMap.render(
      {
        timerBank: this.timerBank,
        seed: this.random.float(0, 1000),
        resolution: this.resolution,
        res1: this.random.float(resMin, resMax),
        res2: this.random.float(resMin, resMax),
        resMix: this.random.float(resMin, resMax),
        mixScale: this.random.float(0.5, 1.0),
        doesRidged: this.random.int(0, 3),
        // doesRidged: 1
      },
      () => {
        this.random.seed = 'res_map';
        const resMod = this.random.float(3, 10);
        resMax *= resMod;
        resMin *= resMod;

        this.random.seed = 'map';
        this.moistureMap.render(
          {
            timerBank: this.timerBank,
            seed: this.random.float(1000, 2000),
            resolution: this.resolution,
            res1: this.random.float(resMin, resMax),
            res2: this.random.float(resMin, resMax),
            resMix: this.random.float(resMin, resMax),
            mixScale: this.random.float(0.5, 1.0),
            doesRidged: this.random.int(0, 3),
            // doesRidged: 0
          },
          () => {
            this.textureMap.render(
              {
                timerBank: this.timerBank,
                resolution: this.resolution,
                heightMaps: this.heightMaps,
                moistureMaps: this.moistureMaps,
                biomeMap: this.biome.texture,
              },
              () => {
                this.normalMap.render(
                  {
                    timerBank: this.timerBank,
                    resolution: this.resolution,
                    waterLevel: this.body.liquid.level,
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
                        waterLevel: this.body.liquid.level,
                      },
                      () => {
                        if (this.hasClouds) {
                          this.clouds.render(
                            {
                              timerBank: this.timerBank,
                              waterLevel: this.body.liquid.level,
                            },
                            () => {
                              this.renderCallback();
                            }
                          );
                        } else {
                          this.renderCallback();
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
      material.emissiveMap = this.textureMaps[i];
      material.normalMap = this.normalMaps[i];
      material.normalScale = new THREE.Vector2(
        this.normalScale,
        this.normalScale
      );
      material.roughnessMap = this.roughnessMaps[i];
      material.metalnessMap = this.roughnessMaps[i];
      material.needsUpdate = true;
    }
  }

  renderBiomeTexture() {
    if (!this.biome.texture) {
      this.biome.generateTexture({ waterLevel: this.body.liquid.level });
    }
  }

  createClouds() {
    if (this.hasClouds) {
      setColor(
        1,
        this.body.gas ? this.body.gas.color.hue : 1.0,
        this.body.gas ? this.body.gas.color.saturation : 1.0,
        this.body.gas ? this.body.gas.color.lightness + 0.25 : 1.0,
        'hsl'
      );
      return new Clouds({
        // rnd: this.seedString,
        random: this.random,
        size: this.body.size,
        resolution: 512,
        show: true,
        color: MISC.colorHelper,
        opacity: this.body.clouds.density,
      });
      // this.ground.add(this.clouds.view);
    }
    return undefined;
  }

  createGlow(callback) {
    if (!this.glow && this.body.glow) {
      const glowSurface = new GlobeSurface(
        {
          body: this.body,
          resolution: this.resolution,
          detail: 0,
          glow: true,
        },
        () => {
          callback();
        }
      );
      this.groundGlow = glowSurface.ground;
      this.groundGlow.name = this.type === 'planet' ? 'Planet low' : 'Moon low';
      this.groundGlow.castShadow = true;
      this.groundGlow.receiveShadow = false;
      this.ground.add(this.groundGlow);
    } else {
      callback();
    }
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
