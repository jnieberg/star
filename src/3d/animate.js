import { TD, EVENT, MISC } from '../variables';
import drawStars, { eventStars } from './bodies/system/stars';
import { eventLabel, labelHide } from './label/label';
import raycastStars from './raycast/raycast-stars';
import raycastBody from './raycast/raycast-planets';

export function render() {
  TD.renderer.render(TD.scene, TD.camera.object);
  MISC.debug.frames += 1;
}

export function loop() {
  EVENT.controls.update(TD.clock.getDelta());
  eventStars();
  eventLabel();
}

export function interval() {
  setInterval(() => {
    drawStars();
    let keepLabel = raycastStars();
    keepLabel = raycastBody() || keepLabel;
    if (!keepLabel && TD.label && TD.label.visible) {
      labelHide();
    }
    MISC.debug.update();
    if (!MISC.started) {
      MISC.timeStart = Date.now() - Number(localStorage.getItem('time'));
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
