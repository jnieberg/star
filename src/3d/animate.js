import { TD, EVENT, MISC, LOD } from '../variables';
import { eventLabel, labelHide } from './label/label';
import raycastSystem from './raycast/raycast-systems';
import raycastBody from './raycast/raycast-bodies';

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
    MISC.debug.update();
  }, MISC.interval);
  // setTimeout(() => {
  //   Store.loadPosition();
  // }, MISC.interval + 100);
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
  if (MISC.loaded === 2) {
    loop();
    render();
  }
}
