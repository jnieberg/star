import { EVENT, TD } from '../../variables';
import setLabel, { labelShow, labelHide } from '../label/label';
import raycastFound from './raycastFound';
import distanceToCamera from '../tools/distanceToCamera';

function raycastStarEvents(intersect) {
	const mesh = intersect.object;
	if (mesh) {
		const star = mesh.this;
		if (star && !TD.label) {
			if (TD.star && TD.star.id !== star.id) {
				EVENT.controls.speedFactorPlanet = 1.0;
			}
		}
		const starInfo = TD.star.text;
		setLabel('star', starInfo);
		// labelHide('stars');
		labelShow('star');
	}
}

export default function raycastStar(star) {
	if (star) {
		const distance = 0.1;
		const intersect = raycastFound(star.object.low, distance, 0);
		const distanceCam = distanceToCamera(star.position.x, star.position.y, star.position.z);
		if (distanceCam < distance) {
			// labelHide('stars');
			if (intersect) {
				raycastStarEvents(intersect);
			} else if (TD.star && TD.label && TD.label.visible) {
				labelHide('star');
			}
		}
	}
}
