import * as THREE from 'three';
import { TD, MISC } from '../../../variables';
import setColor from '../../../misc/color';
import Atmosphere from '../planet/Atmosphere';

export default class BlackHole {
  constructor(star, geometry) {
    this.star = star;

    // Black hole refraction effect
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    this.camera = new THREE.CubeCamera(
      TD.camera.near * TD.scale,
      TD.camera.far * TD.scale,
      cubeRenderTarget,
    );
    this.camera.children.forEach((cam) => {
      cam.fov = 120;
      cam.aspect = window.innerWidth / window.innerHeight;
    });
    this.camera.fov = 120;
    this.camera.renderTarget.texture.mapping = THREE.CubeRefractionMapping;
    this.star.object.add(this.camera);
    const material = new THREE.MeshBasicMaterial({
      envMap: cubeRenderTarget.texture,
      color: 0xffffff,
      refractionRatio: 0.9,
      reflectivity: 1,
      depthWrite: false,
      alphaTest: 0,
    });
    this.star.object.low = new THREE.Mesh(geometry, material);
    this.star.object.low.name = 'Star low';
    this.star.object.low.castShadow = false;
    this.star.object.low.receiveShadow = false;
    this.star.object.low.scale.set(1.5, 1.5, 1.5);
    this.star.object.add(this.star.object.low);
    this.camera.update(TD.renderer, TD.scene);

    // Black hole inner
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x000000,
      blending: THREE.MultiplyBlending,
      alphaTest: 0,
    });
    this.star.object.high = new THREE.Mesh(geometry, material2);
    this.star.object.high.name = 'Star high';
    this.star.object.high.scale.set(1, 1, 1);
    this.star.object.high.castShadow = false;
    this.star.object.high.receiveShadow = false;
    this.star.object.high.renderOrder = 1;
    this.star.object.add(this.star.object.high);

    // Black hole ring
    const size = this.star.size * 0.0001 * TD.scale;
    const sizeRing = size * 4;
    const hue2 = this.star.color.hue - 0.05 > 0 ? this.star.color.hue - 0.05 : 0;
    setColor(1, hue2, 1.0, this.star.color.lightness, 'hsl');
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
    this.star.object.ring = new THREE.Mesh(geometry3, material3);
    this.star.object.ring.name = 'Star ring';
    this.star.object.ring.castShadow = false;
    this.star.object.ring.receiveShadow = false;
    this.star.object.ring.rotateX(Math.PI * 0.5); // Math.sign(this.star.rotationSpeedAroundAxis) *
    this.star.object.ring.renderOrder = 1;
    this.star.object.add(this.star.object.ring);

    // Black hole ring inner
    setColor(2, this.star.color.hue, 1.0, this.star.color.lightness + 0.15, 'hsl');
    const geometry4 = new THREE.RingBufferGeometry(size, sizeRing * 0.8, 32);
    const material4 = new THREE.MeshBasicMaterial({
      map: TD.texture.star.rings,
      color: MISC.colorHelper2,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0,
    });
    this.star.object.ring2 = new THREE.Mesh(geometry4, material4);
    this.star.object.ring2.name = 'Star ring inner';
    this.star.object.ring2.castShadow = false;
    this.star.object.ring2.receiveShadow = false;
    this.star.object.ring2.renderOrder = 1;
    this.star.object.ring.add(this.star.object.ring2);

    // Star double corona
    // eslint-disable-next-line no-unused-vars
    const _ = new Atmosphere(this.star.object.high, {
      size: size * 1.1,
      thickness: size * 1.5,
      color: MISC.colorHelper,
      colorInner: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      opacity: 1,
    });
    // eslint-disable-next-line no-unused-vars
    const __ = new Atmosphere(this.star.object.high, {
      size: size * 1.05,
      thickness: size * 1.2,
      color: MISC.colorHelper2,
      colorInner: MISC.colorHelper2,
      blending: THREE.AdditiveBlending,
      opacity: 1,
    });

    const material5 = new THREE.SpriteMaterial({
      map: TD.texture.star.aura,
      color: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: 0,
    });
    this.star.object.aura = new THREE.Sprite(material5);
    this.star.object.aura.scale.set(size * 3, size * 3, size * 3);
    this.star.object.add(this.star.object.aura);
  }
}
