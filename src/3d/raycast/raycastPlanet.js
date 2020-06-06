import { EVENT, TD } from '../../variables';
import setLabel, { hideLabel, showLabel } from '../label/label';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';
import { getPlanetInfoString, drawPlanet } from '../bodies/planet';
import * as THREE from 'three';

function raycastPlanetEvents(intersect) {
	const mesh = intersect.object;
	if (mesh) {
		const planet = mesh.obj;
		if (planet && (!TD.planet.this || TD.planet.this.id !== planet.id || !TD.label || !TD.label.visible)) {
			const updateLabel = TD.planet.this !== planet;
			TD.planet.this = planet;
			const position = new THREE.Vector3();
			position.setFromMatrixPosition(mesh.matrixWorld);
			TD.planet.this.x = position.x;
			TD.planet.this.y = position.y;
			TD.planet.this.z = position.z;
			if (updateLabel) {
				setLabel(getPlanetInfoString(TD.planet.this));
			}
			showLabel();
			drawPlanet(TD.planet.this);
		}
	}
}

export default function raycastPlanet(obj) {
	if (obj) {
		const distance = 0.01;
		const intersect = raycastFound(obj, distance, 2, true);
		if (intersect) {
			raycastPlanetEvents(intersect);
		} else if (TD.planet && TD.planet.this && TD.label && TD.label.visible) {
			hideLabel();
		}
		if (TD.planet && TD.planet.this) {
			const distanceCam = distanceToCamera(TD.planet.this.x, TD.planet.this.y, TD.planet.this.z);
			if (distanceCam >= distance * TD.scale) {
				TD.planet.this = undefined;
				EVENT.controls.speedFactorPlanet = 1.0;
			} else {
				EVENT.controls.speedFactorPlanet = distanceCam / (distance * 2 * TD.scale);
			}
		}
	}
}
