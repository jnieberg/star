import { EVENT, TD, MISC } from '../../variables';
import setLabel, { labelShow } from '../label/label';
import { distanceToCamera, setCameraParent } from '../init/camera';
import raycastFound from './raycast-found';
import * as THREE from 'three';

function getNearestBody(bodies) {
	let distanceBody = 0;
	let closestBody = undefined;
	for (const body of bodies) {
		if (body.object && body.object.matrixWorld) {
			const position = new THREE.Vector3();
			position.setFromMatrixPosition(body.object.matrixWorld);
			const distanceThis = distanceToCamera(position.x, position.y, position.z);
			if (distanceBody === 0 || distanceBody > distanceThis) {
				closestBody = body;
				distanceBody = distanceThis;
			}
		}
	}
	return {
		distance: distanceBody,
		body: closestBody
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
}

function checkBody(type, body, inOrbit) {
	let foundBody = undefined;
	if (body) {
		if (inOrbit) {
			if (body.type === type && foundBody !== body) {
				foundBody = body;
				foundBody.parent.hideChildren();
				foundBody.drawHigh();
			}
		}
	}
	return foundBody;
}

function checkOrbitBody(body, inOrbit) {
	if (body) {
		if (inOrbit) {
			TD.camera.orbit = body;
			setCameraParent(body.object);
			return true;
		} else if (TD.camera.orbit === body) {
			TD.camera.orbit = undefined;
			setCameraParent(TD.scene);
		}
	}
	return false;
}

export default function raycastBody() {
	if (TD.system) {
		const bodies = TD.system.getAllChildren();
		const distanceOrbitStar = 0.02;
		const distanceOrbitPlanet = 0.0002;
		const distanceOrbitMoon = 0.00002;
		const distanceMax = 0.1;
		const { distance, body } = getNearestBody(bodies);
		if (distance >= distanceMax) {
			if (TD.planet && TD.planet.isPlanet) {
				TD.system.hideChildren();
				TD.planet = undefined;
				TD.moon = undefined;
			}
			EVENT.controls.speedFactorPlanet = 1.0;
			return false;
		} else if (distance > 0) {
			const obj = bodies.map(bd => bd.object.low).filter(bd => bd);
			const intersect = raycastFound(obj, 0.1, 2);
			EVENT.controls.speedFactorPlanet = distance * 100.0 < 1.0 ? distance * 100.0 : 1.0;
			let moon = undefined;
			if (distance < distanceOrbitMoon) {
				moon = body.isMoon && body;
				if (moon && TD.moon !== moon) {
					TD.moon = moon;
					TD.moon.parent.hideChildren();
					TD.moon.drawHigh();
				}
			} else {
				TD.moon = undefined;
			}
			let planet = undefined;
			if (distance < distanceOrbitPlanet) {
				planet = body.isMoon ? body.parent : body.isPlanet ? body : undefined;
				if (planet && TD.planet !== planet) {
					TD.planet = planet;
					TD.system.hideChildren();
					TD.planet.drawHigh();
				}
			} else {
				TD.planet = undefined;
			}
			let star = undefined;
			if (distance < distanceOrbitStar) {
				star = body.isMoon ? body.parent.parent : body.isPlanet ? body.parent : body.isStar ? body : undefined;
				if (star && TD.star !== star) {
					TD.star = star;
				}
			} else {
				TD.star = undefined;
			}
			if (star || planet || moon) {
			// TD.moon = checkBody('moon', body, distance < distanceOrbitMoon);
			// TD.planet = checkBody('planet', body, distance < distanceOrbitPlanet);
			// TD.star = checkBody('star', body, distance < distanceOrbitStar);
				console.log(TD.moon && TD.moon.type, TD.planet && TD.planet.type, TD.star && TD.star.type);
				// if (TD.star || TD.planet || TD.moon) {
				if (!checkOrbitBody(TD.moon, distance < distanceOrbitMoon)) {
					if (!checkOrbitBody(TD.planet, distance < distanceOrbitPlanet)) {
						checkOrbitBody(TD.star, distance < distanceOrbitStar);
					}
				}
			}
			return raycastBodyEvents(intersect);
		}
	}
	return true;
}
