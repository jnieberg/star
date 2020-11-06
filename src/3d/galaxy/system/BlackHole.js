import * as THREE from 'three';

import { TD, MISC, LOD } from '../../../variables';
import Atmosphere from '../globe/Atmosphere';
import MainStar from './MainStar';
import SubStar from './SubStar';

export default class BlackHole extends MainStar {
  constructor({ index, system, parent = system }) {
    super({ index, system, parent });
  }

  // temperature + size?
  get rotationSpeedAroundAxis() {
    if (!this._rotationSpeedAroundAxis) {
      const { temperature } = this;
      const direction = this.random.int(2) === 0 ? -1 : 1;
      const speed = this.random.float(
        temperature * 0.0003,
        temperature * 0.0004
      );
      this.random.seed = 'rotation_speed';
      this._rotationSpeedAroundAxis = direction * speed;
    }
    return this._rotationSpeedAroundAxis;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const temperature = this.temperature.min;
      this.random.seed = 'children';
      // number of planets depends on star temperature and number of stars
      const childrenLength =
        this.random.int(Math.sqrt(temperature) * 0.02) /
        this.parent.children.length;
      if (childrenLength > 0) {
        this.hasSubStar = false;
        this.random.seed = 'sub-star';
        for (let index = 0; index < childrenLength; index += 1) {
          // let child;
          // if (this.system.special === 'black-hole') {
          const child = new SubStar({
            system: this.system,
            index,
            parent: this,
          });
          // }
          if (
            this.system.distance === 0 ||
            child.distance < this.system.distance
          ) {
            children.push(child);
          }
        }
      }
      this._children = children;
    }
    return this._children;
  }

  drawHigh() {
    this.drawPre();
    const size = this.size * 0.0001 * TD.scale;

    // Black hole refraction effect
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    this.camera = new THREE.CubeCamera(
      MISC.camera.near * TD.scale,
      MISC.camera.far * TD.scale,
      cubeRenderTarget
    );
    // this.camera.children.forEach((cam) => {
    // cam.fov = 90;
    // cam.aspect = window.innerWidth / window.innerHeight;
    // const helper = new THREE.CameraHelper(cam);
    // TD.scene.add(helper);
    // });
    // this.camera.fov = 90;
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.renderTarget.texture.mapping = THREE.CubeRefractionMapping;

    const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      envMap: cubeRenderTarget.texture,
      color: 0xffffff,
      refractionRatio: 0.9,
      reflectivity: 1.0,
      depthWrite: false,
      alphaTest: 0,
    });
    this.object.low = new THREE.Mesh(geometry, material);
    this.object.low.name = 'Black hole low';
    this.object.low.castShadow = false;
    this.object.low.receiveShadow = false;
    this.object.low.scale.set(1.5, 1.5, 1.5);
    this.object.low.renderOrder = -3;
    this.object.add(this.object.low);

    this.camera.position.set(
      this.system.position.x * TD.scale,
      this.system.position.y * TD.scale,
      this.system.position.z * TD.scale
    );
    TD.scene.add(this.camera);
    this.camera.update(TD.renderer, TD.scene);

    // Black hole core
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x000000,
      blending: THREE.MultiplyBlending,
      alphaTest: 0,
    });
    this.object.high = new THREE.Mesh(geometry, material2);
    this.object.high.name = 'Black hole high';
    this.object.high.scale.set(1, 1, 1);
    this.object.high.castShadow = false;
    this.object.high.receiveShadow = false;
    this.object.high.renderOrder = 0;
    this.object.add(this.object.high);

    // Black hole ring
    const sizeRing = size * 4;
    const geometry3 = new THREE.RingBufferGeometry(size, sizeRing, 32);
    const material3 = new THREE.MeshBasicMaterial({
      map: TD.texture.star.rings,
      color: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0,
    });
    this.object.ring = new THREE.Mesh(geometry3, material3);
    this.object.ring.name = 'Black hole ring';
    this.object.ring.castShadow = false;
    this.object.ring.receiveShadow = false;
    this.object.ring.rotateX(Math.PI * 0.5);
    this.object.ring.renderOrder = 0;
    this.object.add(this.object.ring);

    // Black hole ring inner
    const geometry4 = new THREE.RingBufferGeometry(size, sizeRing * 0.8, 32);
    const material4 = new THREE.MeshBasicMaterial({
      map: TD.texture.star.rings,
      color: MISC.colorHelper2,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0,
    });
    this.object.ring2 = new THREE.Mesh(geometry4, material4);
    this.object.ring2.name = 'Black hole ring inner';
    this.object.ring2.castShadow = false;
    this.object.ring2.receiveShadow = false;
    this.object.ring2.renderOrder = 0;
    this.object.ring.add(this.object.ring2);

    if (MISC.lod === LOD.LOW) {
      // Sub star flare
      const materialFlare = new THREE.SpriteMaterial({
        map: TD.texture.star.large,
        color: MISC.colorHelper,
        transparent: true,
        blending: THREE.AdditiveBlending,
        alphaTest: 0,
        rotation: Math.PI * 0.25,
      });
      const objectFlare = new THREE.Sprite(materialFlare);
      objectFlare.name = 'Black hole flare';
      objectFlare.scale.set(size * 8, size * 8, size * 8);
      objectFlare.castShadow = false;
      objectFlare.receiveShadow = false;
      objectFlare.renderOrder = 3;
      this.object.add(objectFlare);

      // Star double corona
      // eslint-disable-next-line no-unused-vars
      const _ = new Atmosphere(this.object.high, {
        size: size * 1.01,
        thickness: size * 1.01 * 15,
        color: MISC.colorHelper,
        color2: MISC.colorHelper2,
        blending: THREE.AdditiveBlending,
        opacity: 0.75,
        opacityInner: 1.0,
        power: 5.0,
        depth: false,
      });

      // eslint-disable-next-line no-unused-vars
      const __ = new Atmosphere(this.object.high, {
        size: size * 1.01,
        thickness: size * 1.01 * 1.1,
        color: MISC.colorHelper,
        color2: MISC.colorHelper2,
        blending: THREE.AdditiveBlending,
        opacity: 1.0,
        power: 2.0,
      });
    }

    // Black hole aura
    const material5 = new THREE.SpriteMaterial({
      map: TD.texture.star.aura,
      color: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: 0,
    });
    this.object.aura = new THREE.Sprite(material5);
    this.object.aura.name = 'Black hole aura';
    this.object.aura.scale.set(size * 3, size * 3, size * 3);
    this.object.aura.renderOrder = 0;
    this.object.add(this.object.aura);

    this.drawPost();
  }
}
