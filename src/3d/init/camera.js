import * as THREE from 'three';

import { TD } from '../../variables';

export function setCameraParent(parent) {
  if (TD.camera.object.parent !== parent) {
    parent.attach(TD.camera.object);
  }
}

export function getWorldCamera() {
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  TD.camera.object.getWorldPosition(position);
  TD.camera.object.getWorldQuaternion(quaternion);
  return {
    ...position,
    ...quaternion,
  };
}

export function resetCamera() {
  TD.camera.coordinate = { x: undefined, y: undefined, z: undefined };
  setCameraParent(TD.scene);
  TD.camera.object.position.set(
    TD.entity.system.size * TD.scale * 0.5,
    TD.entity.system.size * TD.scale * 0.5,
    TD.entity.system.size * TD.scale * 0.5,
  );
  TD.camera.object.rotation.set(0, 0, 0);
}

function getCameraPosition(config = TD.entity.system) {
  const position = getWorldCamera();
  return {
    x: position.x / TD.scale + (TD.camera.coordinate.x || 0) * config.size,
    y: position.y / TD.scale + (TD.camera.coordinate.y || 0) * config.size,
    z: position.z / TD.scale + (TD.camera.coordinate.z || 0) * config.size,
  };
}

function getCameraCoordinate(config = TD.entity.system) {
  const camera = getCameraPosition(config);
  return {
    x: Math.floor(camera.x / config.size),
    y: Math.floor(camera.y / config.size),
    z: Math.floor(camera.z / config.size),
  };
}

export function setCameraPosition() {
  const grid = TD.entity.system.size * TD.scale;
  const coordOld = getCameraCoordinate();
  TD.camera.object.position.set(
    (TD.camera.object.position.x + grid) % grid,
    (TD.camera.object.position.y + grid) % grid,
    (TD.camera.object.position.z + grid) % grid,
  );
  const coord = getCameraCoordinate();
  return {
    x: coord.x - coordOld.x,
    y: coord.y - coordOld.y,
    z: coord.z - coordOld.z,
  };
}

export function getCoordinateOffset(config = TD.entity.system) {
  const camera = getCameraCoordinate(config);
  return {
    x: camera.x - (TD.camera.coordinate.x || 0),
    y: camera.y - (TD.camera.coordinate.y || 0),
    z: camera.z - (TD.camera.coordinate.z || 0),
  };
}

export function updateCameraCoordinatesByOffset() {
  const offset = getCoordinateOffset();
  TD.camera.coordinate.x = (TD.camera.coordinate.x || 0) + offset.x;
  TD.camera.coordinate.y = (TD.camera.coordinate.y || 0) + offset.y;
  TD.camera.coordinate.z = (TD.camera.coordinate.z || 0) + offset.z;
}

export function cameraLookDir() {
  const vector = new THREE.Vector3(0, 0, -1);
  vector.applyEuler(TD.camera.object.rotation, TD.camera.object.eulerOrder);
  return vector;
}

function getFixedToCamera(x, y, z) {
  const posC = getWorldCamera();
  const grid = TD.entity.system.size * TD.scale;
  const posOff = {
    x: (x - posC.x),
    y: (y - posC.y),
    z: (z - posC.z),
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

export function distanceToCamera(x, y, z) {
  const posC = getWorldCamera();
  const pos = getFixedToCamera(x, y, z);
  return Math.sqrt(
    (pos.x - posC.x) * (pos.x - posC.x)
    + (pos.y - posC.y) * (pos.y - posC.y)
    + (pos.z - posC.z) * (pos.z - posC.z),
  ) / TD.scale;
}

export function fixObjectToCamera(obj) {
  const posSet = getFixedToCamera(obj.position.x, obj.position.y, obj.position.z);
  obj.position.set(posSet.x, posSet.y, posSet.z);
  return posSet;
}

export function initCamera() {
  TD.camera.object = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    TD.camera.near * TD.scale,
    TD.camera.far * TD.scale,
  );
  TD.scene.add(TD.camera.object);
}
