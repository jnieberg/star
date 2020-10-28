import { EVENT, LAYER, MISC, TD } from '../../variables';
import Store from '../init/Store';
import setLabel, { labelShow } from '../label/label';
import raycastFound from './raycast-found';

function raycastSystemEvents(intersect) {
  const distanceFar = 10;
  const distanceNear = 0.1;
  const tag = intersect.object.name;
  const id = intersect.index;
  let system;
  if (TD.galaxy.star.group[tag] && TD.galaxy.star.group[tag].this && id) {
    system = TD.galaxy.star.group[tag].this[id];
  }
  if (system) {
    if (intersect.distance / TD.scale < distanceFar) {
      if (!TD.system || TD.system.key !== system.key) {
        if (TD.system) TD.system.remove();
        TD.system = system;
        TD.system.draw();
        const starInfo = TD.system.text;
        setLabel(starInfo);
        // console.log(TD.system);
      }
    }
    if (intersect.distance > distanceNear * TD.scale) {
      labelShow();
      return true;
    }
  }
  Store.loadSystem();
  return false;
}

export default function raycastSystem() {
  const distance = 10;
  if (TD.system && TD.system.object) {
    // fixObjectToCamera(TD.system.object);
    const distanceCam = TD.camera.distanceTo(TD.system.object.position);
    EVENT.controls.speedFactorStar =
      distanceCam / (distance * 2) < 1.0 ? distanceCam / (distance * 2) : 1.0;
    if (distanceCam >= distance) {
      TD.system.remove();
      TD.system = undefined;
      TD.star = undefined;
      TD.planet = undefined;
      TD.moon = undefined;
      EVENT.controls.speedFactorStar = 1.0;
      EVENT.controls.speedFactorPlanet = 1.0;
      return false;
    }
  } else {
    TD.raycaster.layers.enable(LAYER.ENTITY);
    const obj = Object.values(TD.galaxy.star.group)
      .map((sys) => sys.object)
      .filter((sys) => sys);
    const intersect = raycastFound(obj, distance, 0.5);
    if (intersect && intersect.object && intersect.object.name) {
      return raycastSystemEvents(intersect);
    }
  }
  return false;
}
