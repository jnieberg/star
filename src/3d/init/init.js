import animate, { interval } from '../animate';
import { initCamera, getWorldCamera } from './camera';
import initScene from './scene';
import initControls, { getMouse, getKeys } from './controls';
import initTextures from './texture';
import { TD, MISC } from '../../variables';
import Debug from '../../misc/debug';
import Galaxy from '../galaxy/Galaxy';

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
    // loadStorage();
    initControls();
    TD.galaxy = new Galaxy();
    initEvents();
    animate();
    interval();
    // intervalShadow();
  });
}
