import { EVENT, TD } from '../../variables';
import setLabel, { labelHide, labelShow } from '../label/label';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';
import * as THREE from 'three';

function raycastPlanetEvents(intersect, planet) {
	if (TD.planet !== planet) {
		TD.planet = planet;
		TD.planet.parent.hideChildren();
		TD.planet.drawHigh();
	}
	if (intersect && intersect.object) {
		// labelHide('star');
		if (planet && (!TD.planet || TD.planet.id !== planet.id || !TD.label || !TD.label.visible)) {
			const foundPlanet = intersect.object.this || intersect.object.parent.this;
			if (foundPlanet) {
				setLabel(foundPlanet.isMoon ? 'moon' : 'planet', foundPlanet.text);
				// labelHide(foundPlanet.isMoon ? 'planet' : 'moon');
				labelShow(foundPlanet.isMoon ? 'moon' : 'planet');
				console.log(foundPlanet);
			}
		}
	} else {
		// labelHide('planet');
		// labelHide('moon');
	}
}

function getClosestPlanet(planets) {
	let distancePlanet = -1;
	let closestPlanet = undefined;
	for (const planet of planets) {
		if (planet.object.low && planet.object.low.matrixWorld) {
			const position = new THREE.Vector3();
			position.setFromMatrixPosition(planet.object.low.matrixWorld);
			position.x = position.x / TD.scale;// + TD.camera.coordinate.x;
			position.y = position.y / TD.scale;// + TD.camera.coordinate.y;
			position.z = position.z / TD.scale;// + TD.camera.coordinate.z;
			const distanceThis = distanceToCamera(position.x, position.y, position.z);
			if (distancePlanet === -1 || distancePlanet > distanceThis) {
				closestPlanet = planet;
				distancePlanet = distanceThis;
			}
		}
	}
	return {
		range: distancePlanet,
		planet: closestPlanet
	};
}

export default function raycastPlanet(bodies) {
	if (bodies) {
		if (TD.star) {
			const planets = TD.star.children;
			const distance = 0.01;
			const { range, planet } = getClosestPlanet(planets);
			if (range >= distance) {
				if (TD.planet) {
					TD.planet.parent.hideChildren();
					TD.planet = undefined;
					EVENT.controls.speedFactorPlanet = 1.0;
				}
			} else if (range > -1) {
				const obj = bodies.map(body => body.object.low);
				const intersect = raycastFound(obj, 0.1, 2);
				if (planet) {
					raycastPlanetEvents(intersect, planet);
				}
				EVENT.controls.speedFactorPlanet = range * 40.0 < 1.0 ? range * 40.0 : 1.0;
			}
		}
	}
}
