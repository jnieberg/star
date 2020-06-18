import { EVENT, TD } from '../../variables';
import setLabel, { hideLabel, showLabel } from '../label/label';
import drawStar, { getStarInfo, getStarInfoString } from '../bodies/star';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';

function raycastStarsEvents(intersect) {
	const distanceNear = 0.1;
	const index = intersect.index;
	if (index) {
		const star = TD.stars.list[index];

		if (star && (!TD.star.this || TD.star.this.id !== star.id)) {
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
	} else {
		showLabel('stars');
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
			const distanceCam = distanceToCamera(TD.star.this.x, TD.star.this.y, TD.star.this.z);
			if (distanceCam >= distance) {
				TD.star.this = undefined;
				EVENT.controls.speedFactorStar = 1.0;
			} else {
				EVENT.controls.speedFactorStar = distanceCam / (distance * 2);
			}
		}
	}
}
