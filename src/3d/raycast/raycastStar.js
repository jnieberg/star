import { EVENT, TD } from '../../variables';
import setLabel from '../label/label';
import drawStar, { getStarInfoString, getStarInfo } from '../bodies/star';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';

function raycastStarEvents(intersect) {
	const index = intersect.index;
	if (index) {
		const star = TD.stars.list[index];
		if (star && (!TD.star.this || TD.star.this.id !== star.id || !TD.label)) {
			if (TD.star.this && TD.star.this.id !== star.id) {
				EVENT.controls.speedFactorPlanet = 1.0;
			}
			TD.star.this = getStarInfo(star);
			setLabel(getStarInfoString(TD.star.this));
			drawStar(TD.star.this);
		}
	}
}

export default function raycastStar(obj) {
	if (obj) {
		const distance = 10;
		const intersect = raycastFound(obj, distance, 0.2);
		if (!TD.planet.this) {
			if (intersect) {
				raycastStarEvents(intersect);
			} else if (TD.star && TD.star.this && TD.label) {
				setLabel();
			}
		}
		if (TD.star && TD.star.this) {
			const distanceCam = distanceToCamera(TD.star.this.x * 100 * TD.scale, TD.star.this.y * 100 * TD.scale, TD.star.this.z * 100 * TD.scale);
			if (distanceCam >= distance * TD.scale) {
				TD.star.this = undefined;
				EVENT.controls.speedFactorStar = 1.0;
			} else {
				EVENT.controls.speedFactorStar = distanceCam / (distance * 2 * TD.scale);
			}
		}
	}
}
