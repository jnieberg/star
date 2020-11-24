import { EVENT, LAYER, TD } from '../../variables';
import Store from '../init/Store';
import setLabel, { labelShow } from '../label/label';
import raycastFound from './raycast-found';

function raycastSystemEvents(intersect) {
  const distanceMax = 10;
  const distanceMin = 0.1;
  const tag = intersect.object.name;
  const id = intersect.index;
  let showLabel = false;
  let system;
  if (TD.galaxy.star.group[tag] && TD.galaxy.star.group[tag].this && id) {
    system = TD.galaxy.star.group[tag].this[id];
  }
  if (system) {
    if (intersect.distance / TD.scale < distanceMax) {
      if (!TD.system || TD.system.key !== system.key) {
        if (TD.system) TD.system.remove();
        TD.system = system;
        TD.system.draw();
        const starInfo = TD.system.text;
        setLabel(starInfo);
        console.log(TD.system);
      }
    }
    if (intersect.distance > distanceMin * TD.scale) {
      labelShow();
    }
    showLabel = true;
  }
  Store.loadSystem();
  return showLabel;
}

export default function raycastSystem() {
  const distanceMax = 10;
  const distanceMin = 0.1;
  if (TD.system && TD.system.object) {
    // fixObjectToCamera(TD.system.object);
    const distance = TD.camera.distanceTo(TD.system.object.position);
    EVENT.controls.speedFactorStar =
      distance / (distanceMax * 1) < 1.0 ? distance / (distanceMax * 1) : 1.0;
    EVENT.controls.speedFactorStar =
      EVENT.controls.speedFactorStar > 0.001
        ? EVENT.controls.speedFactorStar
        : 0.001;

    if (distance >= distanceMax) {
      TD.system.remove();
      TD.system = undefined;
      TD.star = undefined;
      TD.globe = undefined;
      EVENT.controls.speedFactorStar = 1.0;
      EVENT.controls.speedFactorPlanet = 1.0;
    }
    if (distance < distanceMin || distance >= distanceMax) return false;
    return true;
  }
  TD.raycaster.layers.enable(LAYER.ENTITY);
  const obj = Object.values(TD.galaxy.star.group)
    .map((sys) => sys.object)
    .filter((sys) => sys);
  const intersect = raycastFound(obj, distanceMax, 0.5);
  if (intersect && intersect.object && intersect.object.name) {
    return raycastSystemEvents(intersect);
  }

  return false;
}
