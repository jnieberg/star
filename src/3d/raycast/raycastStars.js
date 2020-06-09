import { EVENT, TD } from '../../variables';
import setLabel, { hideLabel } from '../label/label';
import drawStar, { getStarInfo, getStarInfoString } from '../bodies/star';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';

function raycastStarsEvents(intersect) {
	const distanceNear = 0.1;
	const index = intersect.index;
	if (index) {
		const star = TD.stars.list[index];
		if (star && !(TD.star.this && TD.star.this.id === star.id)) {
			if (TD.star.this && TD.star.this.id !== star.id) {
				EVENT.controls.speedFactorPlanet = 1.0;
			}
			TD.star.this = getStarInfo(star);
			setLabel('stars', getStarInfoString(TD.star.this));
			setLabel('star', getStarInfoString(TD.star.this));
			hideLabel('star');
			drawStar(TD.star.this);
		}
	}
	if (intersect.distance <= distanceNear * TD.scale) {
		hideLabel('stars');
	}
}

export default function raycastStars(obj) {
	if (obj) {
		const distance = 10;
		const intersect = raycastFound(obj, distance, 0.2);
		if (intersect) {
			raycastStarsEvents(intersect);
		} else if (TD.star && TD.star.this && TD.label.stars && TD.label.stars.visible) {
			hideLabel('stars');
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
