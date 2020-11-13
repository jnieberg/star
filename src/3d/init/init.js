import animate, { interval, intervalShadow } from '../animate';
import { initCamera } from './camera';
import initScene from './scene';
import initControls, { getMouse, getKeys } from './controls';
import initTextures from './texture';
import { TD, MISC } from '../../variables';
import Debug from '../../misc/debug';
import Galaxy from '../galaxy/Galaxy';
import Store from './Store';
import { Queue } from '../tools/wait';

function initEvents() {
  window.onbeforeunload = () => {
    Store.set();
  };

  window.addEventListener(
    'resize',
    () => {
      TD.camera.object.aspect = window.innerWidth / window.innerHeight;
      TD.camera.object.updateProjectionMatrix();
      TD.renderer.setSize(window.innerWidth, window.innerHeight);
      TD.labelRenderer.setSize(window.innerWidth, window.innerHeight);
      TD.bloomComposer.setSize(window.innerWidth, window.innerHeight);
      TD.finalComposer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  window.addEventListener('mousemove', getMouse, false);
  window.addEventListener('touchmove', getMouse, false);
  window.addEventListener('keypress', getKeys, false);
  window.dispatchEvent(new MouseEvent('mousemove'));
}

export function init() {
  MISC.debug = new Debug();
  // MISC.queue = new Queue();
}

export default function init3d() {
  initTextures().then(() => {
    initCamera();
    initScene();
    initControls();
    TD.galaxy = new Galaxy();
    initEvents();
    animate();
    interval();
    Store.loadCoordinate();
    Store.loadPosition();
    Store.timeout();
    intervalShadow();
  });
}
