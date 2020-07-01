import { EVENT, TD } from '../../variables';
import setLabel, { hideLabel, showLabel } from '../label/label';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';
import { getPlanetInfoString, drawPlanet } from '../bodies/planet';
import * as THREE from 'three';

function raycastPlanetEvents(intersect, planet) {
	if (TD.planet.this !== planet) {
		TD.planet.this = planet;
		drawPlanet(TD.planet.this);
	}
	if (intersect && intersect.object) {
		if (planet && (!TD.planet.this || TD.planet.this.id !== planet.id || !TD.label.planet || !TD.label.planet.visible)) {
			const position = new THREE.Vector3();
			position.setFromMatrixPosition(intersect.object.matrixWorld);
			// TD.planet.this.x = position.x + TD.camera.coordinate.x * TD.stargrid.size * TD.scale;
			// TD.planet.this.y = position.y + TD.camera.coordinate.y * TD.stargrid.size * TD.scale;
			// TD.planet.this.z = position.z + TD.camera.coordinate.z * TD.stargrid.size * TD.scale;
			if (intersect.object.this) {
				setLabel('planet', getPlanetInfoString(intersect.object.this));
			 }
			hideLabel('star');
		}
		showLabel('planet');
	} else {
		hideLabel('planet');
	}
}

function getClosestPlanet(planets) {
	let distancePlanet = -1;
	let closestPlanet = undefined;
	for (let p = 0; p < planets.length; p++) {
		const position = new THREE.Vector3();
		position.setFromMatrixPosition(planets[p].matrixWorld);
		position.x = position.x / TD.scale;// + TD.camera.coordinate.x;
		position.y = position.y / TD.scale;// + TD.camera.coordinate.y;
		position.z = position.z / TD.scale;// + TD.camera.coordinate.z;
		const distanceThis = distanceToCamera(position.x, position.y, position.z);
		if (distancePlanet === -1 || distancePlanet > distanceThis) {
			closestPlanet = planets[p];
			distancePlanet = distanceThis;
		}
	}
	return {
		range: distancePlanet,
		planet: closestPlanet
	};
}

export default function raycastPlanet(obj) {
	if (obj) {
		if (TD.star) {
			const planets = TD.star.children;
			const distance = 0.1;
			const { range, planet } = getClosestPlanet(planets);
			if (range >= distance) {
				TD.planet.this = undefined;
				EVENT.controls.speedFactorPlanet = 1.0;
			} else if (range > -1) {
				const intersect = raycastFound(obj, 0.1, 2);
				if (planet) {
					raycastPlanetEvents(intersect, planet.this);
				}
				// if (TD.planet.this && range < 0.0009) {
				// 	let opacity = (0.0009 - range) * 5000;
				// 	if (opacity > 1) {
				// 		opacity = 1;
				// 	}
				// 	console.log(opacity, opacity * TD.planet.this.outer.opacity);
				// 	TD.planet.sphere.material.opacity = opacity;
				// 	TD.planet.sphereOut.material.opacity = opacity * TD.planet.this.outer.opacity;
				// }
				EVENT.controls.speedFactorPlanet = range * 40.0 < 1.0 ? range * 40.0 : 1.0;
			}
		}
	}
}
