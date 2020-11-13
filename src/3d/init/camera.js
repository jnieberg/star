import * as THREE from 'three';
import { LAYER, MISC, TD } from '../../variables';

export default class Camera {
  constructor() {
    this._parent = undefined;
    this._farFactor = 1.0;
    this.config = TD.entity.system;
    this.object = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      MISC.camera.near * TD.scale,
      MISC.camera.far * TD.scale
    );
    this.object.layers.enable(LAYER.ENTITY);
    this.object.layers.enable(LAYER.SYSTEM);
  }

  add() {
    TD.scene.add(this.object);
    this.reset();
  }

  reset() {
    this.coordinate = { x: 0, y: 0, z: 0 };
    this.parent = TD.scene;
    this.object.position.set(
      this.config.size * TD.scale * 0.5,
      this.config.size * TD.scale * 0.5,
      this.config.size * TD.scale * 0.5
    );
    this.object.rotation.set(0, 0, 0);
    this.farFactor = 1.0;
  }

  get parent() {
    return this._parent;
  }

  set parent(parent) {
    if (this.object.parent !== parent) {
      const parentObject = parent.object || parent;
      this._parent = parent === TD.scene ? undefined : parent;
      if (parentObject.uuid) parentObject.attach(this.object);
    }
  }

  get farFactor() {
    return this._farFactor;
  }

  set farFactor(factor) {
    this._farFactor = factor;
    TD.camera.object.near = MISC.camera.near * TD.scale * factor;
    TD.camera.object.far = MISC.camera.far * TD.scale * factor;
    TD.camera.object.updateProjectionMatrix();
  }

  get universe() {
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    this.object.getWorldPosition(position);
    this.object.getWorldQuaternion(quaternion);
    return {
      ...position,
      ...quaternion,
    };
  }

  get position() {
    const position = this.universe;
    return {
      x: position.x / TD.scale + (this.coordinate.x || 0) * this.config.size,
      y: position.y / TD.scale + (this.coordinate.y || 0) * this.config.size,
      z: position.z / TD.scale + (this.coordinate.z || 0) * this.config.size,
    };
  }

  get _coordinate() {
    const camera = this.position;
    return {
      x: Math.floor(camera.x / this.config.size),
      y: Math.floor(camera.y / this.config.size),
      z: Math.floor(camera.z / this.config.size),
    };
  }

  get offset() {
    const camera = this._coordinate;
    return {
      x: camera.x - (this.coordinate.x || 0),
      y: camera.y - (this.coordinate.y || 0),
      z: camera.z - (this.coordinate.z || 0),
    };
  }

  snap() {
    const grid = this.config.size * TD.scale;
    const coordOld = this._coordinate;
    this.object.position.set(
      (this.object.position.x + grid) % grid,
      (this.object.position.y + grid) % grid,
      (this.object.position.z + grid) % grid
    );
    const coord = this._coordinate;
    return {
      x: coord.x - coordOld.x,
      y: coord.y - coordOld.y,
      z: coord.z - coordOld.z,
    };
  }

  warp() {
    const { offset } = this;
    this.coordinate.x = (this.coordinate.x || 0) + offset.x;
    this.coordinate.y = (this.coordinate.y || 0) + offset.y;
    this.coordinate.z = (this.coordinate.z || 0) + offset.z;
  }

  getFixedToCamera(x, y, z) {
    const posC = this.universe;
    const grid = this.config.size * TD.scale;
    const posOff = {
      x: x - posC.x,
      y: y - posC.y,
      z: z - posC.z,
    };
    let posSet = {
      x: posOff.x < -grid * 0.5 && x + grid,
      y: posOff.y < -grid * 0.5 && y + grid,
      z: posOff.z < -grid * 0.5 && z + grid,
    };
    posSet = {
      x: posSet.x || (posOff.x >= grid * 0.5 && x - grid),
      y: posSet.y || (posOff.y >= grid * 0.5 && y - grid),
      z: posSet.z || (posOff.z >= grid * 0.5 && z - grid),
    };
    posSet = {
      x: posSet.x || x,
      y: posSet.y || y,
      z: posSet.z || z,
    };
    return posSet;
  }

  distanceTo({ x, y, z }) {
    const posC = this.universe;
    const pos = this.getFixedToCamera(x, y, z);
    return (
      Math.sqrt(
        (pos.x - posC.x) * (pos.x - posC.x) +
          (pos.y - posC.y) * (pos.y - posC.y) +
          (pos.z - posC.z) * (pos.z - posC.z)
      ) / TD.scale
    );
  }

  get orbit() {
    return this._parent && this._parent.this;
  }
}

export function initCamera() {
  TD.camera = new Camera();
}
