import { TD, EVENT, MISC, LOD } from '../variables';
import { eventLabel, labelHide } from './label/label';
import raycastSystem from './raycast/raycast-systems';
import raycastBody from './raycast/raycast-bodies';
import Store from './init/Store';

export function render() {
  if (MISC.lod === LOD.HIGH) {
    // TD.renderer.render(TD.scene, TD.camera.object);
    // TD.renderer.clear();
    // TD.camera.object.layers.set(LAYER.SYSTEM);
    TD.bloomComposer.render();
  }
  TD.finalComposer.render();
  // TD.camera.object.layers.set();
  // TD.renderer.render(TD.scene, TD.camera.object);
  TD.labelRenderer.render(TD.scene, TD.camera.object);
  TD.galaxy.update();

  MISC.debug.frames += 1;
}

export function loop() {
  EVENT.controls.update(TD.clock.getDelta());
  TD.fade.update();
  // MISC.queue.check();
}

export function interval() {
  setInterval(() => {
    TD.galaxy.draw();
    let keepLabel = raycastSystem();
    keepLabel = raycastBody() || keepLabel;
    if (!keepLabel && TD.label && TD.label.visible) {
      labelHide();
    }
    eventLabel();
    Store.set();
    MISC.debug.update();
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
  if (MISC.loaded) {
    loop();
    render();
  }
}
