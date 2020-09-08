import * as THREE from 'three';
import { TD, MISC } from '../../../variables';
import setColor from '../../../misc/color';
import Atmosphere from '../planet/Atmosphere';

export default class BlackHole {
  constructor(star, geometry) {
    this.star = star;

    // Black hole refraction effect
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    this.camera = new THREE.CubeCamera(
      TD.camera.near,
      TD.camera.far,
      cubeRenderTarget,
    );
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
      alphaTest: 0,
    });
    this.star.object.high = new THREE.Mesh(geometry, material2);
    this.star.object.high.name = 'Star high';
    this.star.object.high.scale.set(1, 1, 1);
    this.star.object.high.castShadow = false;
    this.star.object.high.receiveShadow = false;
    this.star.object.high.renderOrder = 0;
    this.star.object.add(this.star.object.high);

    // Black hole ring
    const size = this.star.size * 0.0001 * TD.scale;
    const sizeRing = size * 6;
    const hue2 = this.star.color.hue - 0.05 > 0 ? this.star.color.hue - 0.05 : 0;
    setColor(1, this.star.color.hue, 1.0, this.star.color.lightness, 'hsl');
    setColor(2, hue2, 1.0, this.star.color.lightness + 0.15, 'hsl');
    const geometry3 = new THREE.PlaneBufferGeometry(sizeRing, sizeRing);
    const material3 = new THREE.MeshBasicMaterial({
      map: TD.texture.star.rings,
      color: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0,
    });
    this.star.object.ring = new THREE.Mesh(geometry3, material3);
    this.star.object.ring.name = 'Star ring';
    this.star.object.ring.castShadow = false;
    this.star.object.ring.receiveShadow = false;
    this.star.object.ring.rotateX(Math.sign(this.star.rotationSpeedAroundAxis) * Math.PI * 0.5);
    this.star.object.add(this.star.object.ring);

    const material4 = new THREE.MeshBasicMaterial({
      map: TD.texture.star.rings,
      color: MISC.colorHelper2,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0,
    });
    this.star.object.ring2 = new THREE.Mesh(geometry3, material4);
    this.star.object.ring2.name = 'Star ring inner';
    this.star.object.ring2.castShadow = false;
    this.star.object.ring2.receiveShadow = false;
    this.star.object.ring2.scale.set(0.75, 0.75, 0.75);
    this.star.object.ring.add(this.star.object.ring2);

    // Star corona
    // eslint-disable-next-line no-unused-vars
    const _ = new Atmosphere(this.star.object.high, {
      size: size * 1.01,
      thickness: size * 1.5,
      color: MISC.colorHelper,
      colorInner: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      opacity: 1,
    });
  }
}
