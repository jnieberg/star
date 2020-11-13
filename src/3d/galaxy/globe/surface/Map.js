import * as THREE from 'three';
import { TD, MISC } from '../../../../variables';

class Map {
  constructor(resolution, enabled = true) {
    this.resolution = resolution;
    this.enabled = enabled;
    this.fragments = Math.ceil(this.resolution / 512);
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
        this.textures[i] = new THREE.WebGLRenderTarget(
          this.resolution,
          this.resolution,
          {
            precision: 'highp',
            powerPreference: 'high-performance',
            minFilter: THREE.LinearFilter,
          }
        );
        this.textureCameras[i] = new THREE.OrthographicCamera(
          -this.resolution / 2,
          this.resolution / 2,
          this.resolution / 2,
          -this.resolution / 2,
          -100,
          100
        );
        this.textureCameras[i].position.z = 10;

        this.textureScenes[i] = new THREE.Scene();
        this.planes[i] = new THREE.Mesh(this.geos[i], this.mats[i]);
        this.planes[i].position.z = -10;
        this.textureScenes[i].add(this.planes[i]);
        this.maps.push(this.textures[i].texture);
      }
    }
  }

  renderFragment(iA, xA, yA) {
    return new Promise((resolve) => {
      if (MISC.queued) {
        setTimeout(() => {
          this.renderFragment(iA, xA, yA).then(resolve);
        });
      } else {
        MISC.queued = true;
        setTimeout(() => {
          if (MISC.interrupt) {
            // console.log(`[${this.timerBank}] INTERRUPT MAP: ${this.resolution}`);
            return;
          }
          const i = iA || 0;
          const x = xA || 0;
          const y = yA || 0;
          if (i < 6) {
            this.textures[i].setSize(this.resolution, this.resolution);
            this.textureCameras[i].left = -this.resolution / 2;
            this.textureCameras[i].right = this.resolution / 2;
            this.textureCameras[i].top = this.resolution / 2;
            this.textureCameras[i].bottom = -this.resolution / 2;
            this.textureCameras[i].updateProjectionMatrix();
            this.geos[i] = new THREE.PlaneBufferGeometry(
              this.resolution,
              this.resolution,
              1,
              1
            );
            this.planes[i].geometry = this.geos[i];
            this.geos[i].dispose();
            // TD.renderer.autoClear = false;
            let renderPropsNext = [i + 1, 0, 0];
            if (y < this.fragments) {
              if (x < this.fragments) {
                this.renderPart(
                  x,
                  y,
                  this.textures[i],
                  this.textureScenes[i],
                  this.textureCameras[i]
                );
                renderPropsNext = [i, x + 1, y];
              } else {
                renderPropsNext = [i, 0, y + 1];
              }
            } else {
              renderPropsNext = [i + 1, 0, 0];
            }
            MISC.queued = false;
            this.renderFragment(...renderPropsNext).then(resolve);
          } else {
            // console.log(`[${this.timerBank}] CALLBACK MAP: ${this.resolution}`);
            MISC.queued = false;
            resolve();
          }
        });
      }
    });
  }

  render(props) {
    return new Promise((resolve) => {
      this.timerBank = props.timerBank;
      if (this.enabled) {
        // MISC.queue.add(this, 'renderFragment', [0, 0, 0], resolve);
        this.renderFragment(0, 0, 0).then(resolve);
      } else {
        // console.log(`[${this.timerBank}] CALLBACK MAP DONE: ${this.resolution}`);
        resolve();
      }
    });
  }

  renderPart(x, y, texture, scene, camera) {
    TD.renderer.setRenderTarget(texture);
    TD.renderer.antialias = false;
    TD.renderer.setScissorTest(true);
    TD.renderer.setScissor(
      Math.floor((x * this.resolution) / this.fragments),
      Math.floor((y * this.resolution) / this.fragments),
      Math.floor(this.resolution / this.fragments),
      Math.floor(this.resolution / this.fragments)
    );
    TD.renderer.render(scene, camera);
    TD.renderer.antialias = true;
    TD.renderer.setRenderTarget(null);
    TD.renderer.setScissorTest(false);
  }
}

export default Map;
