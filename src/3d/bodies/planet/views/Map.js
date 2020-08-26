import * as THREE from 'three';
import { TD, MISC } from '../../../../variables';
import wait from '../../../tools/wait';

class Map {
  constructor(resolution, enabled = true) {
    this.resolution = resolution;
    this.enabled = enabled;
  }

  setup() {
    this.maps = [];
    this.textures = [];
    this.textureCameras = [];
    this.textureScenes = [];
    this.planes = [];
    this.geos = [];
    if (this.enabled) {
      for (let i = 0; i < 6; i += 1) {
        this.textures[i] = new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
          precision: 'highp',
          powerPreference: 'high-performance',
          minFilter: THREE.LinearFilter,
        });
        this.textureCameras[i] = new THREE.OrthographicCamera(
          -this.resolution / 2,
          this.resolution / 2,
          this.resolution / 2,
          -this.resolution / 2,
          -100,
          100,
        );
        this.textureCameras[i].position.z = 10;

        this.textureScenes[i] = new THREE.Scene();
        // this.geos[i] = new THREE.PlaneGeometry(1, 1);
        this.planes[i] = new THREE.Mesh(this.geos[i], this.mats[i]);
        this.planes[i].position.z = -10;
        this.textureScenes[i].add(this.planes[i]);
        // TD.renderer.setRenderTarget(this.textures[i]);
        // TD.renderer.clear();
        // TD.renderer.render(this.textureScenes[i], this.textureCameras[i]);
        // TD.renderer.setRenderTarget(null);
        this.maps.push(this.textures[i].texture);
      }
    }
  }

  renderFragment(resolution, iA, xA, yA, callback) {
    if (MISC.interrupt) {
      console.log(`[${this.timerBank}] INTERRUPT MAP: ${this.resolution}`);
      return;
    }
    wait(this.timerBank, () => {
      const fragments = Math.ceil(resolution / 64);
      const i = iA || 0;
      const x = xA || 0;
      const y = yA || 0;
      if (i < 6) {
        this.textures[i].setSize(resolution, resolution);
        this.textureCameras[i].left = -resolution / 2;
        this.textureCameras[i].right = resolution / 2;
        this.textureCameras[i].top = resolution / 2;
        this.textureCameras[i].bottom = -resolution / 2;
        this.textureCameras[i].updateProjectionMatrix();
        this.geos[i] = new THREE.PlaneBufferGeometry(resolution, resolution, 1, 1);
        this.planes[i].geometry = this.geos[i];
        this.geos[i].dispose();
        // TD.renderer.autoClear = false;
        if (y < fragments) {
          if (x < fragments) {
            Map.renderPart(
              x, y, resolution, this.textures[i], this.textureScenes[i], this.textureCameras[i],
            );
            this.renderFragment(resolution, i, x + 1, y, callback);
          } else {
            this.renderFragment(resolution, i, 0, y + 1, callback);
          }
        } else {
          this.renderFragment(resolution, i + 1, 0, 0, callback);
        }
      } else if (callback) {
        console.log(`[${this.timerBank}] CALLBACK MAP: ${this.resolution}`);
        callback();
      }
    });
  }

  render(props, callback) {
    this.timerBank = props.timerBank;
    if (this.enabled) {
      this.renderFragment(this.resolution, 0, 0, 0, callback);
    } else if (callback) {
      console.log(`[${this.timerBank}] CALLBACK MAP DONE: ${this.resolution}`);
      callback();
    }
  }

  static renderPart(x, y, resolution, texture, scene, camera) {
    const fragments = Math.ceil(resolution / 64);
    TD.renderer.setRenderTarget(texture);
    TD.renderer.antialias = false;
    TD.renderer.setScissorTest(true);
    TD.renderer.setScissor(
      Math.floor((x * resolution) / fragments),
      Math.floor((y * resolution) / fragments),
      Math.floor(resolution / fragments),
      Math.floor(resolution / fragments),
    );
    TD.renderer.render(scene, camera);
    TD.renderer.antialias = true;
    TD.renderer.setRenderTarget(null);
    TD.renderer.setScissorTest(false);
  }
}

export default Map;
