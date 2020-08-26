import * as THREE from 'three';
import animate, { interval, intervalShadow } from '../animate';
import { initCamera, getWorldCamera, resetCamera } from './camera';
import initScene from './scene';
import { initStars } from '../bodies/system/stars';
import initControls, { getMouse, getKeys } from './controls';
import initTextures from './texture';
import { TD, MISC } from '../../variables';
import Debug from '../../misc/debug';

export function saveStorage() {
  const coord = getWorldCamera();
  localStorage.setItem('camera', JSON.stringify({
    coordinate: TD.camera.coordinate,
    position: { x: coord.x, y: coord.y, z: coord.z },
    rotation: {
      x: coord._x, y: coord._y, z: coord._z, w: coord._w,
    },
  }));
  localStorage.setItem('time', Date.now() - MISC.timeStart);
}

function loadStorage() {
  let item = localStorage.getItem('camera');
  item = JSON.parse(item);
  if (item && item.coordinate && item.position && item.rotation) {
    const quaternion = new THREE.Quaternion(
      item.rotation.x, item.rotation.y, item.rotation.z, item.rotation.w,
    );
    TD.camera.coordinate = item.coordinate;
    TD.camera.object.position.set(item.position.x, item.position.y, item.position.z);
    TD.camera.object.rotation.setFromQuaternion(quaternion);
    MISC.reload = true;
  } else {
    resetCamera();
  }
  MISC.timeStart = Date.now() - Number(localStorage.getItem('time'));
}

function initEvents() {
  window.onbeforeunload = () => {
    saveStorage();
  };

  window.addEventListener('resize', () => {
    TD.camera.object.aspect = window.innerWidth / window.innerHeight;
    TD.camera.object.updateProjectionMatrix();
    TD.renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

  window.addEventListener('mousemove', getMouse, false);
  window.addEventListener('touchmove', getMouse, false);
  window.addEventListener('keypress', getKeys, false);
  window.dispatchEvent(new MouseEvent('mousemove'));
}

export function init() {
  MISC.debug = new Debug();
}

export default function init3d() {
  initTextures(() => {
    initScene();
    initCamera();
    loadStorage();
    initControls();
    initStars();
    initEvents();
    animate();
    interval();
    intervalShadow();
  });
}
