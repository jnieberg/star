import { EVENT, TD } from '../../variables';
import setLabel, { labelShow } from '../label/label';
import { distanceToCamera, fixObjectToCamera } from '../init/camera';
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
      if (!TD.system || TD.system.id !== system.id) {
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
  return false;
}

export default function raycastSystem() {
  const distance = 10;
  if (TD.system && TD.system.object) {
    fixObjectToCamera(TD.system.object);
    const distanceCam = distanceToCamera(
      TD.system.object.position.x,
      TD.system.object.position.y,
      TD.system.object.position.z
    );
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
  }
  const obj = Object.values(TD.galaxy.star.group)
    .map((sys) => sys.object)
    .filter((sys) => sys);
  const intersect = raycastFound(obj, distance, 0.5);
  if (intersect && intersect.object && intersect.object.name) {
    return raycastSystemEvents(intersect);
  }
  return false;
}
