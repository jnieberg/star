import * as THREE from 'three';
import { EVENT, LAYER, MISC, TD } from '../../variables';
import Store from '../init/Store';
import setLabel, { labelShow } from '../label/label';
import raycastFound from './raycast-found';

function getNearestBody(bodies) {
  let distanceBody = 0;
  let closestBody;
  for (let b = 0; b < bodies.length; b += 1) {
    const body = bodies[b];
    if (body.object && body.object.matrixWorld) {
      const position = new THREE.Vector3();
      body.object.getWorldPosition(position);
      const distanceThis = TD.camera.distanceTo(position);
      if (distanceBody === 0 || distanceBody > distanceThis) {
        closestBody = body;
        distanceBody = distanceThis;
      }
    }
  }
  return {
    distance: distanceBody,
    body: closestBody,
  };
}

function raycastBodyEvents(intersect) {
  if (intersect && intersect.object) {
    const foundPlanet = intersect.object.this || intersect.object.parent.this;
    if (!TD.label || !TD.label.visible || foundPlanet.text !== TD.label.text) {
      if (foundPlanet) {
        setLabel(foundPlanet.text);
        labelShow();
      }
    }
    return true;
  }
  return false;
}

function checkOrbitBody(body, inOrbit) {
  if (body && body.object) {
    if (inOrbit) {
      // TD.camera.orbit = body;
      TD.camera.parent = body.object;
      return true;
    }
    if (TD.camera.parent === body) {
      // TD.camera.orbit = undefined;
      TD.camera.parent = TD.scene;
    }
  }
  return false;
}

export default function raycastBody() {
  if (TD.system) {
    const bodies = TD.system.getAllChildren();
    const distanceMax = 0.1;
    const { distance, body } = getNearestBody(bodies);
    const bodyRadius = body ? body.size * 0.0001 * 0.5 : 0;
    const distanceOrbitStar = 0.01 + bodyRadius;
    const distanceOrbitPlanet = 0.0005 + bodyRadius;
    const distanceOrbitMoon = 0.00005 + bodyRadius;
    if (distance >= distanceMax) {
      if (TD.planet && TD.planet.type === 'planet') {
        TD.system.hideChildren();
        TD.planet = undefined;
        TD.moon = undefined;
      }
      EVENT.controls.speedFactorPlanet = 1.0;
      return false;
    }
    if (distance > 0 && distance < distanceOrbitStar) {
      TD.raycaster.layers.enable(LAYER.SYSTEM);
      const obj = bodies.map((bd) => bd.object.low).filter((bd) => bd);
      const intersect = raycastFound(obj, 0.1, 2);
      EVENT.controls.speedFactorPlanet =
        distance * 100.0 < 1.0 ? distance * 100.0 : 1.0;
      let moon;
      if (distance < distanceOrbitMoon) {
        moon = body.type === 'moon' && body;
        if (moon && TD.moon !== moon) {
          TD.moon = moon;
          TD.moon.parent.hideChildren();
          TD.moon.drawHigh();
        }
      } else if (TD.moon) {
        TD.moon = undefined;
      }
      let planet;
      if (distance < distanceOrbitPlanet) {
        planet = body.type === 'moon' && body.parent;
        planet = planet || (body.type === 'planet' && body);
        if (planet && TD.planet !== planet) {
          TD.planet = planet;
          TD.planet.parent.hideChildren();
          TD.planet.drawHigh();
        }
        TD.camera.farFactor = distance * 1000 > 0.001 ? distance * 1000 : 0.001;
      } else if (TD.planet) {
        TD.planet = undefined;
        TD.camera.farFactor = 1.0;
      }
      let star;
      if (distance < distanceOrbitStar) {
        star = body.type === 'moon' && body.parent.parent;
        star = star || (body.type === 'planet' && body.parent);
        star = star || (body.type === 'star' && body);
        // star = body.star;
        if (star && TD.star !== star) {
          TD.star = star;
        }
      }
      if (star || planet || moon) {
        // console.log(
        //   TD.moon && TD.moon.type,
        //   TD.planet && TD.planet.type,
        //   TD.star && TD.star.type,
        // );
        if (!checkOrbitBody(TD.moon, distance < distanceOrbitMoon)) {
          if (!checkOrbitBody(TD.planet, distance < distanceOrbitPlanet)) {
            checkOrbitBody(TD.star, distance < distanceOrbitStar);
          }
        }
      }
      return raycastBodyEvents(intersect);
    }
    if (TD.star) {
      // TD.star.parent.hideChildren();
      TD.star = undefined;
      // TD.camera.orbit = undefined;
      TD.camera.parent = TD.scene;
      return false;
    }
  }
  return true;
}
