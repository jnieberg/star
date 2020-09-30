import * as THREE from 'three';
import { TD, EVENT, MISC } from '../variables';
import { eventLabel, labelHide } from './label/label';
import raycastSystem from './raycast/raycast-systems';
import raycastBody from './raycast/raycast-bodies';
import { resetCamera } from './init/camera';

export function render() {
  TD.renderer.render(TD.scene, TD.camera.object);
  MISC.debug.frames += 1;
}

export function loop() {
  EVENT.controls.update(TD.clock.getDelta());
  TD.galaxy.update();
  eventLabel();
}

export function loadStorage() {
  let item = localStorage.getItem('camera');
  item = JSON.parse(item);
  if (
    item &&
    item.coordinate &&
    item.position &&
    item.rotation &&
    typeof item.coordinate.x !== 'undefined'
  ) {
    const quaternion = new THREE.Quaternion(
      item.rotation.x,
      item.rotation.y,
      item.rotation.z,
      item.rotation.w
    );
    TD.camera.coordinate = item.coordinate;
    TD.camera.object.position.set(
      item.position.x,
      item.position.y,
      item.position.z
    );
    TD.camera.object.rotation.setFromQuaternion(quaternion);
    MISC.reload = true;
  } else {
    resetCamera();
  }
  MISC.timeStart = Date.now() - Number(localStorage.getItem('time'));
}

export function interval() {
  setInterval(() => {
    TD.galaxy.draw();
    let keepLabel = raycastSystem();
    keepLabel = raycastBody() || keepLabel;
    if (!keepLabel && TD.label && TD.label.visible) {
      labelHide();
    }
    MISC.debug.update();
    if (!MISC.started) {
      loadStorage();
      MISC.started = true;
    }
  }, MISC.interval);
}

export function intervalShadow() {
  setInterval(() => {
    if (TD.system) {
      TD.system.updateShadows();
    }
  }, MISC.intervalShadow);
}

export default function animate() {
  MISC.animation = requestAnimationFrame(animate);
  loop();
  render();
}
