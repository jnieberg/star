import * as THREE from 'three';
import { EVENT, LAYER, TD } from '../../variables';
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
      TD.camera.parent = body.object;
      return true;
    }
    if (TD.camera.parent === body) {
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
    const distanceOrbitGlobe = 0.0005 + bodyRadius;
    if (distance >= distanceMax) {
      if (TD.globe && TD.globe.type === 'planet') {
        TD.system.hideChildren();
        TD.globe = undefined;
      }
      EVENT.controls.speedFactorPlanet = 1.0;
      return false;
    }
    if (distance > 0 && distance < distanceOrbitStar) {
      const speedMin =
        TD.camera.orbit && TD.camera.orbit.type !== 'star' ? 0.0 : 0.01;
      TD.raycaster.layers.enable(LAYER.SYSTEM);
      const obj = bodies.map((bd) => bd.object.low).filter((bd) => bd);
      const intersect = raycastFound(obj, 0.1, 2);
      EVENT.controls.speedFactorPlanet =
        distance * 10.0 < 1.0 ? distance * 10.0 : 1.0;
      EVENT.controls.speedFactorPlanet =
        EVENT.controls.speedFactorPlanet > speedMin
          ? EVENT.controls.speedFactorPlanet
          : speedMin;
      // let moon;
      // if (distance < distanceOrbitMoon) {
      //   moon = body.type === 'moon' && body;
      //   if (moon && TD.globe !== moon) {
      //     TD.globe = moon;
      //     TD.globe.parent.hideChildren();
      //     TD.globe.drawHigh();
      //   }
      // } else if (TD.globe) {
      //   TD.globe = undefined;
      // }
      let globe;
      if (distance < distanceOrbitGlobe) {
        // globe = body.type === 'moon' && body.parent;
        globe =
          globe || ((body.type === 'planet' || body.type === 'moon') && body);
        if (globe && TD.globe !== globe) {
          TD.globe = globe;
          TD.globe.parent.hideChildren();
          TD.globe.drawHigh();
          if (TD.globe.parent.type === 'planet') {
            TD.globe.parent.drawHigh();
          }
        }
        TD.camera.farFactor = distance * 1000 > 0.001 ? distance * 1000 : 0.001;
      } else if (TD.globe) {
        TD.globe = undefined;
        TD.camera.farFactor = 1.0;
      }
      let star;
      if (distance < distanceOrbitStar) {
        // star = body.type === 'moon' && body.parent.parent;
        // star = star || (body.type === 'planet' && body.parent);
        // star = star || (body.type === 'star' && body);
        star = body.subStar || body.star;
        if (star && TD.star !== star) {
          TD.star = star;
        }
      }
      if (star || globe) {
        // || moon
        // console.log(
        //   TD.moon && TD.moon.type,
        //   TD.planet && TD.planet.type,
        //   TD.star && TD.star.type,
        // );
        // if (!checkOrbitBody(TD.moon, distance < distanceOrbitMoon)) {
        if (!checkOrbitBody(TD.globe, distance < distanceOrbitGlobe)) {
          checkOrbitBody(TD.star, distance < distanceOrbitStar);
        }
        // }
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
  return false;
}
