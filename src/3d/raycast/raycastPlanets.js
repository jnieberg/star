import { EVENT, TD } from '../../variables';
import setLabel, { labelShow } from '../label/label';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';
import * as THREE from 'three';

function getAllBodies() {
	const moons = TD.star.children.map(child => child.children).flat(Infinity).filter(child => child.object && child.object.low);
	return [ ...moons, ...TD.star.children, TD.star ];
}

function getNearestBody(bodies) {
	let distanceBody = 0;
	let closestBody = undefined;
	for (const body of bodies) {
		if (body.object) {
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

export default function raycastBody() {
	if (TD.star) {
		const bodies = getAllBodies();
		const distanceMax = 0.1;
		const { distance, body } = getNearestBody(bodies);
		if (distance >= distanceMax) {
			if (TD.planet && TD.planet.isPlanet) {
				TD.star.hideChildren();
				TD.planet = undefined;
			}
			EVENT.controls.speedFactorPlanet = 1.0;
			return false;
		} else if (distance > 0) {
			const obj = bodies.map(bd => bd.object.low);
			const intersect = raycastFound(obj, 0.1, 2);
			EVENT.controls.speedFactorPlanet = distance * 40.0 < 1.0 ? distance * 40.0 : 1.0;
			const planet = body.isMoon ? body.parent : body.isPlanet ? body : undefined;
			if (planet) {
				if (TD.planet !== planet) {
					TD.star.hideChildren();
					TD.planet = planet;
					TD.planet.drawHigh();
				}
			}
			return raycastBodyEvents(intersect);
		}
	}
	return true;
}
