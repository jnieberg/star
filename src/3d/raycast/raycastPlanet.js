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
			TD.planet.this.x = position.x;
			TD.planet.this.y = position.y;
			TD.planet.this.z = position.z;
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

export default function raycastPlanet(obj) {
	if (obj) {
		if (TD.star) {
			const planets = TD.star.children;
			const distance = 0.1;
			let distancePlanet = -1;
			let closestPlanet = undefined;
			for (let p = 0; p < planets.length; p++) {
				const position = new THREE.Vector3();
				position.setFromMatrixPosition(planets[p].matrixWorld);
				const distanceThis = distanceToCamera(position.x, position.y, position.z);
				if (distancePlanet === -1 || distancePlanet > distanceThis) {
					closestPlanet = planets[p];
					distancePlanet = distanceThis;
				}
			}
			distancePlanet = distancePlanet / TD.scale;
			if (distancePlanet >= distance * TD.scale) {
				TD.planet.this = undefined;
				EVENT.controls.speedFactorPlanet = 1.0;
			} else {
				const intersect = raycastFound(obj, 0.1, 2);
				if (closestPlanet) {
					raycastPlanetEvents(intersect, closestPlanet.this);
				}
				EVENT.controls.speedFactorPlanet = distancePlanet * 40.0 < 1.0 ? distancePlanet * 40.0 : 1.0;
			}
		}
	}
}
