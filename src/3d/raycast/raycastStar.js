import { EVENT, TD } from '../../variables';
import { showLabel, hideLabel } from '../label/label';
import raycastFound from './raycastFound';
import distanceToCamera from '../tools/distanceToCamera';

function raycastStarEvents(intersect) {
	const mesh = intersect.object;
	if (mesh) {
		const star = mesh.this;
		if (star && !TD.label.star) {
			if (TD.star.this && TD.star.this.id !== star.id) {
				EVENT.controls.speedFactorPlanet = 1.0;
			}
		}
		hideLabel('stars');
		showLabel('star');
	}
}

export default function raycastStar(obj) {
	if (obj) {
		const distance = 0.1;
		const intersect = raycastFound(obj, distance, 2);
		const distanceCam = distanceToCamera(TD.star.this.x * 100 * TD.scale, TD.star.this.y * 100 * TD.scale, TD.star.this.z * 100 * TD.scale);
		if (distanceCam < distance * TD.scale) {
			hideLabel('stars');
			if (intersect) {
				raycastStarEvents(intersect);
			} else if (TD.star && TD.star.this && TD.label.star && TD.label.star.visible) {
				hideLabel('star');
			}
		}
	}
}
